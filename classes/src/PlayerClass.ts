import { Intelligence } from './Intelligence'
import { getConfig } from './config'

const { paddleWidth, paddleHeight, boardWidth, boardHeight, playerSpeed, boardPadding } =
  getConfig()

export type Side = 'left' | 'right'
export type Vector2 = [number, number]
export type Direction = -1 | 1 | 0
export type Controller = 'keys' | 'mouse' | 'ai' | 'wall'
export type StimulateTypes = 'bounce' | 'move' | 'fail'

export type PlayerClassProps = {
  side: Side
  controller?: Controller
  height?: number
  brain?: Intelligence
}

export class PlayerClass {
  side: Side
  xEdge: number
  xFail: number
  yTop: number
  yBottom: number
  controller: Controller
  brain?: Intelligence
  score: number = 0
  stimulation: number = 0
  height: number = paddleHeight

  constructor({ side, height = paddleHeight, controller = 'keys', brain }: PlayerClassProps) {
    this.side = side
    this.xEdge =
      side === 'left' ? paddleWidth + boardPadding : boardWidth - paddleWidth - boardPadding
    this.xFail = side === 'left' ? this.xEdge - paddleWidth : this.xEdge + paddleWidth
    this.height = controller === 'wall' ? boardHeight : height
    this.yTop = boardHeight / 2 - this.height / 2
    this.yBottom = this.yTop + this.height
    this.controller = controller
    this.brain = brain
  }

  updatePosition = (direction: Direction) => {
    if (direction === 0) return

    this.stimulate('move')

    if ((this.yTop <= 0 && direction < 0) || (this.yBottom >= boardHeight && direction > 0)) return

    this.yTop = Math.max(
      0,
      Math.min(boardHeight - this.height, this.yTop + direction * playerSpeed),
    )
    this.yBottom = this.yTop + this.height
  }

  stimulate = (type: StimulateTypes) => {
    if (this.controller !== 'ai') return

    const config = getConfig()
    this.stimulation = this.stimulation + config[`${type}Stimulation`]
  }

  addScore = () => {
    this.score = this.score + 1
  }

  reset = () => {
    this.score = 0
    this.stimulation = 0
    this.yTop = boardHeight / 2 - this.height / 2
    this.yBottom = this.yTop + this.height
  }
}
