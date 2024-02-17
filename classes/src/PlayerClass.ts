import { Intelligence } from './Intelligence'
import { getConfig, Config, StimulateType } from './config'

const { paddleWidth, paddleHeight, boardWidth, boardHeight, playerSpeed, boardPadding } =
  getConfig()

const freeEnergy = (boardHeight - paddleHeight) / 2
const energyStep = playerSpeed / freeEnergy

export type Side = 'left' | 'right'
export type Vector2 = [number, number]
export const controllers = ['env', 'ai', 'keys'] as const
export type Controller = (typeof controllers)[number]

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
  height: number = paddleHeight
  controller: Controller
  brain?: Intelligence
  score: number = 0
  stimulation: number = 0
  energy = 1
  previousMove = -1 | 1

  constructor({ side, height = paddleHeight, controller = 'keys', brain }: PlayerClassProps) {
    this.side = side
    this.xEdge =
      side === 'left' ? paddleWidth + boardPadding : boardWidth - paddleWidth - boardPadding
    this.xFail = side === 'left' ? this.xEdge - paddleWidth / 2 : this.xEdge + paddleWidth / 2
    this.height = controller === 'env' ? boardHeight : height
    this.yTop = boardHeight / 2 - this.height / 2
    this.yBottom = this.yTop + this.height
    this.controller = controller
    this.brain = brain
  }

  refill = () => {
    this.energy = 1
  }

  updatePosition = (direction: number) => {
    if (direction === 0) {
      this.previousMove = 0
      return
    }

    const directionAbs = Math.abs(direction)

    this.energy = this.energy - directionAbs * energyStep
    if (this.energy <= 0) {
      this.energy = 0
      this.stimulate('move', directionAbs)
    }

    if (this.previousMove !== direction) {
      this.stimulate('move')
      this.previousMove = direction
    }

    if ((this.yTop <= 0 && direction < 0) || (this.yBottom >= boardHeight && direction > 0)) return

    this.yTop = Math.max(
      0,
      Math.min(boardHeight - this.height, this.yTop + direction * playerSpeed),
    )
    this.yBottom = this.yTop + this.height
  }

  stimulate = (type: StimulateType, multi: number = 1) => {
    if (this.controller !== 'ai') return

    const config = getConfig()
    this.stimulation = this.stimulation + config[type as keyof Config] * multi
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
