import { GameSet } from './GameSet'
import { Statistic } from './Generation'
import { Intelligence } from './Intelligence'
import { Controller, PlayerClass } from './PlayerClass'
import { getConfig, setConfig, subscribe } from './config'
import { forEachRight } from './utils/forEachRight'
import { getSavedPlayers } from './utils/getSavedPlayers'

const LOCAL_STORAGE_LEADER = 'leader'
const LEADER_AUTO_UPDATE_TIMEOUT = 7500

type Leader = {
  set: GameSet
  player: PlayerClass
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
  hasHuman = false
  hasPointer = false
  hasKeys = false

  sets: GameSet[] = []
  firstGeneration: GameSet[] = []
  statistic = new Statistic()

  leader?: Leader

  status: 'gene poll generation' | 'selection' | 'final selection' = 'gene poll generation'
  iterationTicks = 0
  initDeathScore = getConfig().deathScore

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
    this.hasPointer = this.leftController === 'pointer' || this.rightController === 'pointer'
    this.hasHuman = this.hasKeys || this.hasPointer

    this.reset()

    const createControllerBrain = (controller: Controller | Intelligence) => {
      if (controller instanceof Intelligence) {
        // TODO how to prevent leader sibling index
        this.statistic.increase(controller.generation)
        return new Intelligence({ ...controller })
      } else if (controller === 'ai') {
        const siblingIndex = this.statistic.increase(1)
        return new Intelligence({
          generation: 1,
          siblingIndex,
        })
      }
    }

    if (!this.hasEnv) {
      const set = this.createSet(
        createControllerBrain(this.leftController),
        createControllerBrain(this.rightController),
      )

      const index = this.leftController === 'ai' ? 0 : 1

      const leader = set.players[index].brain
      if (!leader) return

      this.leader = {
        set,
        player: set.players[index],
      }

      const generationNumber = leader?.generation || 0
      const generation = this.statistic.createGeneration(generationNumber)
      generation.count = 1
      generation.lastSiblingIndex = leader.siblingIndex || 0
    } else if (this.rightController instanceof Intelligence) {
      this.random(createControllerBrain(this.rightController))
    }
  }

  restart = () => {
    this.sets.map(set => {
      set.players.map(player => player.reset())
      set.ball.reset()
    })
  }

  reset = () => {
    this.sets = []
    this.statistic = new Statistic()
    this.leader = undefined
    if (this.hasEnv) {
      this.status = 'gene poll generation'
    }
  }

  update = () => {
    if (!this.statistic.population) return []

    if (this.hasHuman || this.hasOnlyAi) {
      const set = this.sets[0]
      set.tick()
      return [set]
    }

    this.iterationTicks = this.iterationTicks + 1
    const { deathScore } = this.config

    this.sets.forEach(set => {
      set.tick()
      const [wall, ai] = set.players

      if (!ai.brain) return

      if (wall.score > deathScore) {
        this.killSet(set)
        return
      }

      if (!this.leader || wall.score < this.leader?.set.players[0].score) {
        this.leader = {
          set,
          player: ai,
        }
      }
    })

    return [...this.sets]
  }

  generateGeneration() {
    if (!this.statistic.population) return

    if (!this.firstGeneration.length) {
      this.firstGeneration = [...this.sets]
      this.status = 'selection'
      this.initDeathScore = this.config.deathScore
    }

    console.debug(
      `[${this.statistic.getLastGenerationNumber(() => true)}] ${this.iterationTicks} frms`,
    )
    this.iterationTicks = 0
    this.sets.forEach(set => {
      set.players[0].reset(false)
      set.players[1].reset(false)
    })

    const childrenCount = Math.floor(
      (this.config.population - this.statistic.population) / this.statistic.population,
    )

    if (childrenCount) {
      const setsForDivide = [...this.sets]

      if (this.config.crossover) {
        const setsForCrossover = [...this.sets]
        const newGeneration = this.statistic.getLastGenerationNumber(() => true) + 1
        this.crossover(setsForCrossover, childrenCount / 2, newGeneration)
        this.divide(setsForDivide, childrenCount / 2)
      } else {
        this.divide(setsForDivide, childrenCount)
      }
    }

    this.shiftEnv()
  }

  shiftEnv = () => {
    const generation = this.statistic.getLastGenerationNumber()
    setConfig({ deathScore: Math.floor(this.initDeathScore / generation) })
  }

  divide(sets: GameSet[], childrenCount: number) {
    console.debug('divide')
    sets.forEach(set => {
      const player = set.players[1] //
      if (!player.brain) return false

      for (let index = 0; index < childrenCount; index++) {
        const siblingIndex = this.statistic.increase(player.brain.generation + 1)
        this.createSet(undefined, player.brain.mutate(siblingIndex))
      }
    })
  }

  crossover(sets: GameSet[], childrenCount: number, generation: number) {
    console.debug('crossover')
    const secondParentSets = [...sets, ...this.firstGeneration]

    sets.forEach(set => {
      const player1 = set.players[1] // TODO
      if (!player1.brain) return false

      const set2Index = Math.floor(Math.random() * secondParentSets.length)
      const set2 = secondParentSets[set2Index]
      const player2 = set2.players[1] // TODO
      if (!player2.brain) return false

      for (let index = 0; index < childrenCount / 2; index++) {
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

  random = (parent?: Intelligence) => {
    const count = parent ? this.config.population - 1 : this.config.population * 3

    if (parent) {
      this.createSet(undefined, parent)
    }

    const generation = (parent?.generation || 0) + 1
    for (let index = 0; index < count; index++) {
      const siblingIndex = this.statistic.increase(generation)
      const brain = parent
        ? parent.mutate(siblingIndex)
        : new Intelligence({
            generation,
            siblingIndex,
          })
      this.createSet(undefined, brain)
    }
  }

  mutateLeader = (count = this.config.population) => {
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
      player.destroy()
      if (!player.brain) return
      this.statistic.decrease(player.brain.generation)
    })

    this.sets[index].ball.destroy()

    this.sets.splice(index, 1)

    if (this.statistic.population <= this.config.surviversCount) {
      this.generateGeneration()
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
