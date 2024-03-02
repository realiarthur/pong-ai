export class PointerController {
  board: HTMLElement | undefined
  y: number = 0

  constructor(board: HTMLElement) {
    this.board = board
    this.board.addEventListener('touchmove', this.move, true)
    this.board.addEventListener('mousemove', this.move, true)
  }

  destroy = () => {
    this.board?.removeEventListener('touchmove', this.move, true)
    this.board?.removeEventListener('mousemove', this.move, true)
  }

  move = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    // console.debug(e.target, e)
    // @ts-ignore
    this.y = e.layerY ?? this.y
  }
}
