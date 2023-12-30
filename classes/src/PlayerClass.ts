import { Intelligence, Weights } from './Intelligence'
import { config } from './config'

const { paddleWidth, paddleHeight, boardWidth, boardHeight, playerSpeed, boardPadding } = config

export type Side = 'left' | 'right'
export type Vector2 = [number, number]
export type Direction = -1 | 1 | 0
export type Controller = 'keyboard' | 'mouse' | 'ai'

export type PlayerClassProps = {
  side: Side
  y?: number
  controller: Controller
  dna?: Weights
}

export class PlayerClass {
  side: Side
  xEdge: number
  xFail: number
  yTop: number
  yBottom: number
  controller: Controller
  brain?: Intelligence
  stimulation: number = 0

  constructor({
    side,
    y = boardHeight / 2 - paddleHeight / 2,
    controller = 'keyboard',
    dna,
  }: PlayerClassProps) {
    this.side = side
    this.xEdge =
      side === 'left' ? paddleWidth + boardPadding : boardWidth - paddleWidth - boardPadding
    this.xFail = side === 'left' ? this.xEdge - paddleWidth : this.xEdge + paddleWidth
    this.yTop = y
    this.yBottom = this.yTop + paddleHeight
    this.controller = controller

    if (controller === 'ai') {
      this.brain = new Intelligence(dna)
    }
  }

  updatePosition = (direction: Direction) => {
    if (direction === 0) return
    if ((this.yTop <= 0 && direction < 0) || (this.yBottom >= boardHeight && direction > 0)) {
      return
    }

    this.stimulate(1)
    this.yTop = this.yTop + direction * playerSpeed
    this.yBottom = this.yTop + paddleHeight
  }

  stimulate = (x: number) => {
    this.stimulation = this.stimulation + x
  }
}
