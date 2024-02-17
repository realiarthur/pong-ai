import { GameSet } from './GameSet'
import { Statistic } from './Generation'
import { Intelligence } from './Intelligence'
import { Controller, PlayerClass, controllers } from './PlayerClass'
import { getConfig, shiftEnvironment, subscribe } from './config'
import { getSavedPlayers } from './utils/getSavedPlayers'

const LOCAL_STORAGE_LEADER = 'leader'
const LEADER_AUTO_UPDATE_TIMEOUT = 7500
const { VISIBLE_SETS_COUNT } = getConfig()

type Leader = {
  set: GameSet
  player: PlayerClass
  playerIndex: number
}

const forEachRight = <T>(array: T[], callback: (item: T, index: number) => void) => {
  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index]
    callback(element, index)
  }
}
export class EngineClass {
  savedPlayers = getSavedPlayers()
  config = getConfig()
  unsubscriber = subscribe(config => {
    this.config = config
  })

  leftController: Controller | Intelligence = 'keys'
  rightController: Controller | Intelligence = 'ai'
  hasAi = false
  hasOnlyAi = false
  hasEnv = false
  hasEnvAi = false
  hasKeys = false

  sets: GameSet[] = []
  statistic = new Statistic()

  leader?: Leader
  watchIndividual?: Leader
  watchGeneration?: number | false
  lastLeaderAutoUpdate = 0

  destroy = () => {
    this.unsubscriber()
  }

  setControllers = (
    leftController: Controller | Intelligence = 'env',
    rightController: Controller | Intelligence = 'ai',
  ) => {
    this.leftController = leftController
    this.rightController = rightController
    this.hasAi =
      this.leftController === 'ai' ||
      this.leftController instanceof Intelligence ||
      this.rightController === 'ai' ||
      this.rightController instanceof Intelligence
    this.hasOnlyAi =
      (this.leftController === 'ai' || this.leftController instanceof Intelligence) &&
      (this.rightController === 'ai' || this.rightController instanceof Intelligence)
    this.hasEnv = this.leftController === 'env' || this.rightController === 'env'
    this.hasEnvAi = this.hasAi && this.hasEnv
    this.hasKeys = this.leftController === 'keys' || this.rightController === 'keys'

    this.reset()

    const createControllerBrain = (controller: Controller | Intelligence) => {
      if (controller instanceof Intelligence) {
        // TODO how to prevent leader sibling index
        const siblingIndex = this.statistic.increase(controller.generation)
        return new Intelligence({ ...controller })
      } else if (controller === 'ai') {
        const siblingIndex = this.statistic.increase(1)
        return new Intelligence({
          generation: 1,
          siblingIndex,
        })
      }
    }

    const set = this.createSet(
      createControllerBrain(this.leftController),
      createControllerBrain(this.rightController),
    )
    this.sets = [set]

    if (this.hasAi) {
      const index = this.leftController === 'ai' ? 0 : 1

      const leader = set.players[index].brain
      if (!leader) return

      this.leader = {
        set,
        player: set.players[index],
        playerIndex: index,
      }

      const generationNumber = leader?.generation || 0
      const generation = this.statistic.createGeneration(generationNumber)
      generation.count = 1
      generation.lastSiblingIndex = leader.siblingIndex || 0

      // this.watchIndividual = {
      //   set,
      //   player: set.players[index],
      //   playerIndex: index,
      // }
      // this.watchGeneration = leader.generation
    }
  }

  restart = () => {
    this.sets.map(set => {
      set.players.map(player => player.reset())
      set.ball.respawn(true)
    })
  }

  reset = () => {
    this.sets = []
    this.statistic = new Statistic()
    this.leader = undefined
    this.watchIndividual = undefined
    this.watchGeneration = undefined
  }

  update = () => {
    if (!this.statistic.population) return []

    if (this.hasKeys || this.hasOnlyAi) {
      const set = this.sets[0]
      set.tick()
      return [set]
    }

    const { divisionThreshold, deathThreshold, fail } = this.config

    if (this.watchGeneration && !this.statistic.hasGeneration(this.watchGeneration)) {
      this.setWatchGeneration(false)
    }

    const currentWatchGeneration =
      this.watchGeneration ??
      this.statistic.getLastGenerationNumber(
        generation => generation.count && generation.survived < generation.count,
      )

    if (this.watchIndividual?.set.dead || this.watchIndividual?.set.survived) {
      this.watchIndividual = undefined
    }

    const updateLeader =
      !this.leader ||
      this.leader.set.dead ||
      this.leader.set.survived ||
      Date.now() - this.lastLeaderAutoUpdate > LEADER_AUTO_UPDATE_TIMEOUT

    if (this.watchIndividual) {
      this.leader = this.watchIndividual
    } else if (updateLeader) {
      this.leader = undefined
    }

    this.sets.forEach(set => {
      if (set.survived) return

      set.tick()

      set.players.forEach((player, playerIndex) => {
        if (!player.brain) return

        if (player.stimulation >= divisionThreshold) {
          set.survived = true
          this.statistic.increaseSurvived(player.brain.generation)
          return
        }

        if (
          !this.hasKeys &&
          this.hasEnvAi &&
          player.stimulation <= Math.max(deathThreshold, 3 * fail)
        ) {
          this.killSet(set)
          return
        }

        if (!this.watchIndividual && updateLeader) {
          const isWatchedGeneration =
            !currentWatchGeneration || player.brain.generation === currentWatchGeneration
          const isAiGameLeader =
            this.hasOnlyAi && player.score > (this.leader?.player.score ?? -divisionThreshold)
          const isEnvGameLeader =
            this.hasEnvAi &&
            player.stimulation > (this.leader?.player.stimulation ?? -divisionThreshold)

          if (isWatchedGeneration && (isAiGameLeader || isEnvGameLeader)) {
            this.lastLeaderAutoUpdate = Date.now()
            this.leader = {
              set,
              player,
              playerIndex,
            }
          }
        }
      })
    })

    if (this.statistic.survivedCount / this.statistic.population >= 0.9) {
      this.generateGeneration()
    }

    return [...this.sets]
  }

  generateGeneration() {
    forEachRight(this.sets, set => {
      if (set.survived) return
      this.killSet(set)
    })

    console.debug('survived:', this.statistic.population)

    const childrenCount = Math.floor(
      (this.config.population - this.statistic.population) / this.statistic.population,
    )

    if (childrenCount) {
      const setsForDivide = [...this.sets]
      const setsForCrossover = [...this.sets]
      const newGeneration = this.statistic.getLastGenerationNumber(() => true) + 1

      this.crossover(setsForCrossover, childrenCount / 2, newGeneration)
      this.divide(setsForDivide, childrenCount / 2)
    }

    // TODOC add final selection statement
    shiftEnvironment()
    this.statistic.resetSurvived()
  }

  divide(sets: GameSet[], childrenCount: number) {
    console.debug('divide')
    sets.forEach(set => {
      const player = set.players[1] // TODOC
      if (!player.brain) return false

      player.stimulation = 0
      player.score = 0

      for (let index = 0; index < childrenCount; index++) {
        const siblingIndex = this.statistic.increase(player.brain.generation + 1)
        this.createSet(undefined, player.brain.mutate(siblingIndex))
      }

      set.survived = false
    })
  }

  crossover(sets: GameSet[], childrenCount: number, generation: number) {
    console.debug('crossover')
    const middle = Math.floor((sets.length - 1) / 2)

    sets.forEach((set, index) => {
      if (index > middle) return

      const player1 = set.players[1] // TODOC
      if (!player1.brain) return false
      player1.stimulation = 0
      player1.score = 0
      set.survived = false

      let set2Index = sets.length - index - 1
      set2Index = set2Index === index ? 0 : set2Index

      const set2 = sets[set2Index]

      const player2 = set2.players[1] // TODOC
      if (!player2.brain) return false
      player2.stimulation = 0
      player2.score = 0
      set2.survived = false

      for (let index = 0; index < childrenCount; index++) {
        const siblingIndex = this.statistic.increase(generation, 2)

        const [child1, child2] = Intelligence.crossover(
          player1.brain,
          player2.brain,
          generation,
          siblingIndex,
        )

        this.createSet(undefined, child1)
        this.createSet(undefined, child2)
      }
    })
  }

  createBrain = (brain?: Intelligence, mutate = true) => {
    // TODOC how to prevent leader sibling index
    const siblingIndex = this.statistic.increase((brain?.generation ?? 0) + 1)

    if (brain && !mutate) {
      return brain
    }

    if (!brain) {
      return new Intelligence({
        generation: 1,
        siblingIndex,
      })
    }

    return brain.mutate(siblingIndex)
  }

  createSet = (leftBrain?: Intelligence, rightBrain?: Intelligence) => {
    const players = [
      new PlayerClass({
        side: 'left',
        controller: this.leftController instanceof Intelligence ? 'ai' : this.leftController,
        brain: leftBrain,
      }),
      new PlayerClass({
        side: 'right',
        controller: this.rightController instanceof Intelligence ? 'ai' : this.rightController,
        brain: rightBrain,
      }),
    ] as const

    const key = `${players[0].brain?.getKey() || players[0].controller}-${
      players[1].brain?.getKey() || players[1].controller
    }`

    const set = new GameSet(players, key)
    this.sets.push(set)
    return set
  }

  random = (count: number = this.config.population) => {
    for (let index = 0; index < count; index++) {
      const siblingIndex = this.statistic.increase(1)
      const brain = new Intelligence({
        generation: 1,
        siblingIndex,
      })
      this.createSet(undefined, brain)
    }
  }

  mutateLeader = (count = this.config.population * this.config.populationIncreaseMulti) => {
    const brain = this.leader?.player.brain
    if (!brain) return

    for (let index = 0; index < count; index++) {
      const siblingIndex = this.statistic.increase(brain.generation + 1)

      const child = brain.mutate(siblingIndex)

      this.createSet(undefined, child)
    }
  }

  killSet = (set?: GameSet) => {
    const index = set ? this.sets.indexOf(set) : -1
    if (!set || index === -1) return

    set.kill()
    this.sets[index].players.forEach(player => {
      if (!player.brain) return
      this.statistic.decrease(player.brain.generation)
    })

    this.sets[index].ball.destroy()

    this.sets.splice(index, 1)
  }

  watchLeaderToggle = () => {
    if (this.watchIndividual) {
      this.watchIndividual = undefined
    } else if (this.leader?.player.brain) {
      this.watchIndividual = this.leader
      this.watchGeneration = this.leader.player.brain?.generation
    }
  }

  setWatchGeneration = (number: number | false) => {
    this.lastLeaderAutoUpdate = 0
    this.watchIndividual = undefined
    this.watchGeneration = number === this.statistic.getLastGenerationNumber() ? undefined : number
  }

  loadLeader = () => {
    const json = localStorage.getItem(LOCAL_STORAGE_LEADER)
    const leader = Intelligence.deserialize(json)

    if (leader) {
      this.reset()
      this.statistic = new Statistic()
      this.statistic.population = 1

      const set = this.createSet(
        this.leftController instanceof Intelligence ? this.leftController : undefined,
        leader,
      )
      this.sets = [set]

      const generationNumber = leader?.generation || 0
      const generation = this.statistic.createGeneration(generationNumber)
      generation.count = 1
      generation.lastSiblingIndex = leader.siblingIndex || 0
      const index = this.leftController === 'ai' ? 0 : 1
      this.watchIndividual = {
        set,
        player: set.players[index],
        playerIndex: index,
      }
      this.watchGeneration = leader.generation
    }
  }

  saveLeader = () => {
    const brain = this.leader?.player.brain
    if (brain) {
      const value = brain.serialize()
      localStorage.setItem(LOCAL_STORAGE_LEADER, value)
      localStorage.setItem(
        `${LOCAL_STORAGE_LEADER}#${brain.generation}.${brain.siblingIndex}`,
        value,
      )
    }
    this.savedPlayers = getSavedPlayers()
  }
}
