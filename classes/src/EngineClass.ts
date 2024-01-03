import { BallClass } from './BallClass'
import { GameSet } from './GameSet'
import { Intelligence } from './Intelligence'
import { Controller, PlayerClass } from './PlayerClass'
import { getConfig } from './config'

const LOCAL_STORAGE_LEADER = 'leader'

type Leader = {
  index: number
  set: GameSet
  player: PlayerClass
}
export class EngineClass {
  sets: GameSet[] = []
  lookingForLeader = false
  leader?: Leader
  leftController: Controller = 'keys'
  rightController: Controller = 'ai'
  commonLeftPlayer?: PlayerClass
  commonRightPlayer?: PlayerClass

  setControllers = (leftController: Controller = 'wall', rightController: Controller = 'ai') => {
    this.leftController = leftController
    this.rightController = rightController

    // if (leftController === 'keys' || leftController === 'mouse') {
    //   this.commonLeftPlayer = new PlayerClass({ side: 'left', controller: this.leftController })
    // }

    // if (rightController === 'keys' || rightController === 'mouse') {
    //   this.commonRightPlayer = new PlayerClass({ side: 'right', controller: this.rightController })
    // }

    this.loadLeader()
  }

  update() {
    this.leader = {
      index: 0,
      set: this.sets[0],
      player: this.sets[0].players[1],
    }

    this.sets.forEach((set, index) => {
      set.tick()
      set.players.forEach(player => {
        if (
          player.controller === 'ai' &&
          player.stimulation > (this.leader?.player.stimulation || 0)
        ) {
          this.leader = {
            index,
            set,
            player,
          }
        }
      })
    })
  }

  createSets = (leaderIntelligence?: Intelligence, count = getConfig().population) => {
    let leaderCreated = false
    const createAi = () => {
      if (leaderIntelligence && !leaderCreated) {
        leaderCreated = true
        return leaderIntelligence
      }

      return leaderIntelligence ? leaderIntelligence.mutate() : new Intelligence()
    }

    this.sets = Array.from({ length: count }, () => {
      const players = [
        this.commonLeftPlayer ??
          new PlayerClass({
            side: 'left',
            controller: this.leftController,
            brain: this.leftController === 'ai' ? createAi() : undefined,
          }),
        this.commonRightPlayer ??
          new PlayerClass({
            side: 'right',
            controller: this.rightController,
            brain: this.rightController === 'ai' ? createAi() : undefined,
          }),
      ] as const

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

      return new GameSet(players, ball)
    })
  }

  mutateLeader = () => {
    this.createSets(this.leader?.player.brain)
  }

  loadLeader = () => {
    const json = localStorage.getItem(LOCAL_STORAGE_LEADER)
    const leader = Intelligence.deserialize(json)
    if (leader) {
      this.createSets(leader, 1)
    }
  }

  saveLeader = () => {
    if (this.leader?.player.brain) {
      localStorage.setItem(LOCAL_STORAGE_LEADER, this.leader.player.brain.serialize())
    }
  }

  restart = () => {
    this.sets.map(set => {
      set.players.map(player => player.reset())
      set.ball.respawn(true)
    })
  }
}
