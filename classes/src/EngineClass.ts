import { BallClass } from './BallClass'
import { GameSet } from './GameSet'
import { Generation } from './Generation'
import { Intelligence } from './Intelligence'
import { Controller, PlayerClass, stimulateTypes } from './PlayerClass'
import { Config, getConfig, setConfig, subscribe } from './config'

const LOCAL_STORAGE_LEADER = 'leader'
const LEADER_AUTO_UPDATE_TIMEOUT = 7500
const { VISIBLE_SETS_COUNT } = getConfig()

export const envConfig = [...stimulateTypes, 'ballSpeed', 'maxMutation', 'wallMinAngle'] as const

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

const initConfig = getConfig()
export class EngineClass {
  sets: GameSet[][] = []
  setsCount: number = 0
  population = 0
  lookingForLeader = false
  leader?: Leader
  leftController: Controller = 'keys'
  rightController: Controller = 'ai'
  generationsStat: Array<Generation | undefined> = []
  config = initConfig
  unsubscriber: () => void
  hasAi = false
  hasOnlyAi = false
  hasEnv = false
  hasEnvAi = false
  hasKeys = false
  watchIndividual?: Leader
  watchGeneration?: number | false
  lastLeaderAutoUpdate = 0

  constructor() {
    this.unsubscriber = subscribe(config => {
      this.config = config
    })
  }

  destroy = () => {
    this.unsubscriber()
  }

  setControllers = (leftController: Controller = 'env', rightController: Controller = 'ai') => {
    this.leftController = leftController
    this.rightController = rightController
    this.hasAi = this.leftController === 'ai' || this.rightController === 'ai'
    this.hasOnlyAi = this.leftController === 'ai' && this.rightController === 'ai'
    this.hasEnv = this.leftController === 'env' || this.rightController === 'env'
    this.hasEnvAi = this.hasAi && this.hasEnv
    this.hasKeys = this.leftController === 'keys' || this.rightController === 'keys'

    this.clearSets()
  }

  update = () => {
    if (!this.sets.length) return []

    const { divisionThreshold, fail, deathThreshold } = this.config

    const postponeLeaderAutoUpdate =
      this.hasKeys ||
      (!this.hasOnlyAi &&
        this.leader &&
        !this.leader.set.dead &&
        Date.now() - this.lastLeaderAutoUpdate < LEADER_AUTO_UPDATE_TIMEOUT)

    this.leader = this.watchIndividual ?? (postponeLeaderAutoUpdate ? this.leader : undefined)

    if (this.watchIndividual?.set.dead) {
      this.watchIndividual = undefined
    }

    if (this.watchGeneration && !this.generationsStat[this.watchGeneration]?.count) {
      this.setWatchGeneration(false)
    }

    let divisionCandidate: Leader | false = false

    const currentWatchGeneration = this.watchGeneration ?? this.getLastGenerationWithCount()

    // right to let last generation has children faster
    forEachRight(this.sets, generation => {
      if (!generation) return
      generation.forEach(set => {
        set.tick()

        set.players.forEach((player, playerIndex) => {
          if (!player.brain) return

          if (!this.watchIndividual && !postponeLeaderAutoUpdate) {
            const isWatchedGeneration =
              !currentWatchGeneration || player.brain.generation === currentWatchGeneration
            const isAiGameLeader =
              this.hasOnlyAi &&
              playerIndex === 1 &&
              player.score > (this.leader?.player.score ?? -divisionThreshold)
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

          if (
            player.stimulation >= divisionThreshold &&
            (!divisionCandidate ||
              (player.brain.generation === divisionCandidate.player.brain?.generation &&
                player.stimulation > divisionCandidate.player.stimulation))
          ) {
            divisionCandidate = {
              set,
              player,
              playerIndex,
            }
          }

          if (!this.hasKeys && this.hasEnvAi && player.stimulation <= deathThreshold) {
            this.killSet(player.brain.generation, set)
          }
        })
      })
    })

    if (divisionCandidate) {
      const hasBeenDivided = this.dividePlayer(divisionCandidate)
      if (!hasBeenDivided) {
        this.restartOldGenerations()
      }
    }

    let visibleSets: GameSet[] = []
    for (let index = 0; index < this.sets.length; index++) {
      const generation = this.sets[index]
      if (!generation) continue

      visibleSets = [...visibleSets, ...generation]
      if (visibleSets.length > VISIBLE_SETS_COUNT) {
        visibleSets = visibleSets.slice(0, VISIBLE_SETS_COUNT)
        break
      }
    }

    return visibleSets
  }

  restartOldGenerations(notToRestartCount = 1) {
    const { divisionThreshold } = this.config

    if (this.sets.filter(Boolean).length > notToRestartCount) {
      let passedCount = 0

      forEachRight(this.sets, generation => {
        if (!generation) return

        if (passedCount < notToRestartCount) {
          passedCount = passedCount + 1
          return
        }

        generation.forEach(set => {
          set.players.forEach(player => {
            if (player.stimulation > divisionThreshold) {
              player.stimulation = divisionThreshold
            } else if (player.stimulation < 0) {
              this.killSet(player.brain?.generation, set)
            }
          })
        })
      })
    }
  }

  dividePlayer(leader: Leader): boolean {
    const { player, set, playerIndex } = leader
    if (!player.brain) return false

    const { divisionThreshold, divisionScore, population, populationIncreaseMulti } = this.config

    const maxPopulation = this.hasOnlyAi ? population / 2 : population
    const envGameDivision =
      this.hasEnvAi && divisionThreshold && player.stimulation >= divisionThreshold
    const aiAiGameDivision = this.hasOnlyAi && player.score >= divisionScore

    if (
      !(
        (envGameDivision || aiAiGameDivision) &&
        this.population <= maxPopulation * (1 - populationIncreaseMulti)
      )
    )
      return false

    if (this.hasOnlyAi) {
      this.killSet(player.brain.generation, set)
      if (playerIndex === 1) {
        this.createSet(player.brain)
        return true
      }
      return false
    }

    player.stimulation = 0
    player.score = 0

    const maxGeneration = this.generationsStat.length - 1 || 1

    this.createSets(player.brain)

    if (player.brain.generation === maxGeneration) {
      console.log('complication for new generation:', player.brain.generation + 1)

      setConfig(config => {
        return envConfig.reduce((result, type) => {
          const value = config[type]
          const step = config[`${type}EnvStep`]
          const final = config[`${type}EnvFinal`]

          const hasReachedFinal =
            value === final || step === 0 || (step > 0 ? value > final : value < final)

          if (hasReachedFinal) {
            return result
          }

          return {
            ...result,
            [type]: Math.round((value + step) * 1000) / 1000,
          }
        }, {} as Partial<Config>)
      })
    }
    return true
  }

  createGeneration = (number: number) => {
    const generation = new Generation(number)
    this.generationsStat[number] = generation
    return generation
  }

  getLastGenerationWithCount = () => {
    return [...this.generationsStat].reverse().find(item => item?.count)?.number || 0
  }

  createGenerationSibling = (parent?: Intelligence) => {
    this.population = this.population + 1
    const generationNumber = (parent?.generation || 0) + 1

    const generation =
      this.generationsStat[generationNumber] ?? this.createGeneration(generationNumber)

    const siblingIndex = generation.increase()

    if (!parent) {
      return new Intelligence({
        generation: generationNumber,
        siblingIndex,
      })
    }

    return parent.mutate(siblingIndex)
  }

  createSets = (
    parent?: Intelligence,
    count = this.config.population * this.config.populationIncreaseMulti,
  ) => {
    for (let index = 0; index < count; index++) {
      const set = this.createSet(parent)
      if (set.players[1].brain?.generation === undefined) return

      if (!this.sets[set.players[1].brain?.generation]) {
        this.sets[set.players[1].brain?.generation] = []
      }

      this.sets[set.players[1].brain?.generation].push(set)
    }
  }

  createSet = (parent?: Intelligence, mutate = true) => {
    const createAi = () => {
      if (parent && !mutate) {
        return parent
      }

      return this.createGenerationSibling(parent)
    }

    const players = [
      new PlayerClass({
        side: 'left',
        controller: this.leftController,
        brain: this.hasOnlyAi ? parent : this.leftController === 'ai' ? createAi() : undefined,
      }),
      new PlayerClass({
        side: 'right',
        controller: this.rightController,
        brain: this.hasOnlyAi
          ? this.createGenerationSibling(parent)
          : this.rightController === 'ai'
          ? createAi()
          : undefined,
      }),
    ] as const

    let key = `${this.leftController} - ${this.rightController}`
    if (this.leftController === 'ai') {
      key = `${players[0].brain?.generation}.${players[0].brain?.siblingIndex}`
    } else if (this.rightController === 'ai') {
      key = `${players[1].brain?.generation}.${players[1].brain?.siblingIndex}`
    }

    const ball = new BallClass({
      onFail: side => {
        if (side === 'left') {
          players[1].addScore()
          players[0].stimulate('fail')
        } else {
          players[0].addScore()
          players[1].stimulate('fail')
        }
      },
    })

    return new GameSet(players, ball, key)
  }

  killSet = (generation?: number, set?: GameSet) => {
    if (generation === undefined || set === undefined) return

    set.kill()
    const index = this.sets[generation].indexOf(set)
    if (index === -1) return

    this.population = this.population - (this.hasOnlyAi ? 2 : 1)

    this.sets[generation][index].players.forEach(player => {
      if (!player.brain) return

      player.kill()
      this.generationsStat[player.brain.generation]?.decrease()
    })

    this.sets[generation][index].ball.destroy()

    this.sets[generation].splice(index, 1)
  }

  clearSets = () => {
    this.sets = []
    this.generationsStat = []
  }

  loadLeader = () => {
    const json = localStorage.getItem(LOCAL_STORAGE_LEADER)
    const leader = Intelligence.deserialize(json)

    if (leader) {
      this.clearSets()
      this.population = 1
      const set = this.createSet(leader, false)
      this.sets[leader.generation] = [set]

      const generationNumber = leader?.generation || 0
      const generation = this.createGeneration(generationNumber)
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
  }

  restart = () => {
    this.sets.map(generation => {
      generation.forEach(set => {
        set.players.map(player => player.reset())
        set.ball.respawn(true)
      })
    })
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
    this.watchGeneration = number === this.getLastGenerationWithCount() ? undefined : number
  }
}
