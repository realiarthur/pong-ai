import { Intelligence } from './Intelligence'
import { getConfig, Config } from './config'

const { paddleWidth, paddleHeight, boardWidth, boardHeight, playerSpeed, boardPadding } =
  getConfig()

const freeMovementsQuantity = boardHeight - paddleHeight

export type Side = 'left' | 'right'
export type Vector2 = [number, number]
export type Direction = -1 | 1 | 0
export const controllers = ['env', 'ai', 'keys'] as const
export type Controller = (typeof controllers)[number]
export const stimulateTypes = ['bounce', 'move', 'fail'] as const
export type StimulateType = (typeof stimulateTypes)[number]

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
  movementsSinceBounce = 0
  dead = false
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

  kill = () => {
    this.dead = true
  }

  updatePosition = (direction: Direction) => {
    if (direction === 0) {
      this.previousMove = 0
      return
    }

    if ((this.yTop <= 0 && direction < 0) || (this.yBottom >= boardHeight && direction > 0)) return

    this.movementsSinceBounce = this.movementsSinceBounce + playerSpeed
    if (this.movementsSinceBounce > freeMovementsQuantity) {
      this.stimulate('move')
    }

    if (this.previousMove !== direction) {
      this.stimulate('move')
      this.previousMove = direction
    }

    this.yTop = Math.max(
      0,
      Math.min(boardHeight - this.height, this.yTop + direction * playerSpeed),
    )
    this.yBottom = this.yTop + this.height
  }

  stimulate = (typeOrValue: StimulateType | number, multi: number = 1) => {
    if (this.controller !== 'ai') return

    if (typeof typeOrValue === 'number') {
      this.stimulation = this.stimulation + typeOrValue
      return
    }

    const config = getConfig()
    this.stimulation = this.stimulation + config[typeOrValue as keyof Config] * multi

    if (typeOrValue === 'bounce') {
      this.movementsSinceBounce = 0
    }
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
