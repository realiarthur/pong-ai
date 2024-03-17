import { PlayerClass } from 'classes'
import { boardScreenRatio } from 'core/setCssConst'

export class PointerController {
  board: HTMLElement
  player: PlayerClass
  y = 0

  constructor(board: HTMLElement, player: PlayerClass) {
    this.board = board
    this.player = player
    this.board?.addEventListener('touchmove', this.move, true)
    this.board?.addEventListener('mousemove', this.move, true)
  }

  destroy = () => {
    this.board.removeEventListener('touchmove', this.move, true)
    this.board.removeEventListener('mousemove', this.move, true)
  }

  move = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    // @ts-ignore
    const y = e.layerY
    if (y) {
      this.player.setPosition(y / boardScreenRatio, true)
    }
  }
}
