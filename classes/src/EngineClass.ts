import { GameSet } from './GameSet'
import { Statistic } from './Statistic'
import { Intelligence } from './Intelligence'
import { Controller, PlayerClass } from './PlayerClass'
import { getConfig, setConfig, subscribe } from './config'

export const FIRST_GENERATION_MULTI = 3

type Leader = {
  set: GameSet
  player: PlayerClass
}

export class EngineClass {
  leftController: Controller | Intelligence = 'keys'
  rightController: Controller | Intelligence = 'ai'

  hasAi = false
  hasOnlyAi = false
  hasEnv = false
  hasEnvAi = false
  hasPointer = false
  hasKeys = false
  hasHuman = false

  sets: GameSet[] = []
  firstGeneration: GameSet[] = []
  statistic = new Statistic()
  leader?: Leader

  config = getConfig()
  unsubscriber = subscribe(config => {
    this.config = config
  })
  initDeathScore?: number

  destroy = () => {
    this.unsubscriber()
    this.sets.forEach(set => this.killSet(set))
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
  }

  reset = () => {
    this.sets = []
    this.statistic = new Statistic()
    this.leader = undefined

    const createBrainCopy = (controller: Controller | Intelligence) => {
      if (controller instanceof Intelligence) {
        this.statistic.increase(controller.generation)
        return new Intelligence({ ...controller })
      }
    }

    if (!this.hasEnv) {
      const onScore = (set: GameSet) => {
        const leader = set.getWinner()
        this.leader = {
          set,
          player: leader,
        }
      }
      this.createSet(
        createBrainCopy(this.leftController),
        createBrainCopy(this.rightController),
        onScore,
      )
    } else {
      const parent = createBrainCopy(this.rightController)
      this.random(parent)
    }
  }

  tick = () => {
    if (!this.statistic.population) return

    if (this.hasHuman || this.hasOnlyAi) {
      const set = this.sets[0]
      set.tick()
      return
    }

    const { deathScore } = this.config
    this.statistic.tick()

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
  }

  killSet = (set?: GameSet) => {
    if (!set) return

    const index = this.sets.indexOf(set)
    if (index === -1) return

    this.sets[index].destroy({
      onBrainDestroy: (brain: Intelligence) => {
        this.statistic.decrease(brain.generation)
      },
    })

    this.sets.splice(index, 1)

    if (this.statistic.population <= this.config.surviversCount) {
      this.generateGeneration()
    }
  }

  generateGeneration() {
    if (!this.statistic.population) return

    this.statistic.newGeneration()

    if (this.initDeathScore === null) {
      this.initDeathScore = this.config.deathScore
    }

    this.sets.forEach(set => {
      set.players[0].reset(false)
      set.players[1].reset(false)
    })

    const childrenCount = Math.floor(
      (this.config.population - this.statistic.population) / this.statistic.population,
    )
    if (!childrenCount) return

    const setsForDivide = [...this.sets]
    this.divide(setsForDivide, childrenCount)
    this.shiftEnvironment()
  }

  shiftEnvironment = () => {
    if (!this.initDeathScore) {
      this.initDeathScore = this.config.deathScore
    }
    const generation = this.statistic.getLastGenerationNumber()
    const deathScore = Math.floor(this.initDeathScore / generation)
    if (deathScore !== this.config.deathScore) {
      setConfig({ deathScore: Math.floor(this.initDeathScore / generation) })
    }
  }

  divide(sets: GameSet[], childrenCount: number) {
    sets.forEach(set => {
      const [, ai] = set.players
      if (!ai.brain) return false

      for (let index = 0; index < childrenCount; index++) {
        const siblingIndex = this.statistic.increase(ai.brain.generation + 1)
        const child = ai.brain.mutate(siblingIndex, this.config.maxMutation)
        this.createSet(undefined, child)
      }
    })
  }

  createSet = (
    leftBrain?: Intelligence,
    rightBrain?: Intelligence,
    onScore?: (set: GameSet) => void,
  ) => {
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

    const set = new GameSet(players, onScore)
    this.sets.push(set)
    return set
  }

  random = (parent?: Intelligence) => {
    const count = parent
      ? this.config.population - 1
      : this.config.population * FIRST_GENERATION_MULTI

    if (parent) {
      this.createSet(undefined, parent)
    }

    const generation = (parent?.generation || 0) + 1
    for (let index = 0; index < count; index++) {
      const siblingIndex = this.statistic.increase(generation)
      const brain = parent
        ? parent.mutate(siblingIndex, this.config.maxMutation)
        : new Intelligence({
            generation,
            siblingIndex,
          })
      this.createSet(undefined, brain)
    }
  }
}
