import { GameSet } from './GameSet'
import { PlayerClass } from './PlayerClass'

export class EngineClass {
  sets: GameSet[]
  leader?: PlayerClass

  constructor(set: GameSet[]) {
    this.sets = set
  }

  update() {
    this.sets.forEach(set => {
      set.tick()
      if (set.players[1].stimulation > (this.leader?.stimulation || 0)) {
        this.leader = set.players[1]
      }
    })
  }
}
