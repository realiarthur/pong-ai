import { Intelligence } from './Intelligence'
import { getConfig, subscribe } from './config'

const { paddleWidth, paddleHeight, boardWidth, boardHeight, playerSpeed, aiSpeed, boardPadding } =
  getConfig()

export type Side = 'left' | 'right'
export const controllers = ['keys', 'pointer', 'env', 'ai'] as const
export type Controller = (typeof controllers)[number]

const xPositions: Record<Side, { back: number; center: number; edge: number }> = {
  left: {
    back: boardPadding,
    center: boardPadding + paddleWidth / 2,
    edge: boardPadding + paddleWidth,
  },
  right: {
    back: boardWidth - boardPadding,
    center: boardWidth - boardPadding - paddleWidth / 2,
    edge: boardWidth - boardPadding - paddleWidth,
  },
}

export type PlayerClassProps = {
  side: Side
  controller?: Controller
  height?: number
  brain?: Intelligence
}

export class PlayerClass {
  side: Side
  controller: Controller
  brain?: Intelligence
  xEdge: number
  xCenter: number
  xBack: number
  yTop: number
  yBottom: number
  speed: number
  height = paddleHeight
  score = 0
  unsubscriber?: () => void

  constructor({ side, height = paddleHeight, controller = 'keys', brain }: PlayerClassProps) {
    this.side = side
    this.controller = controller
    this.brain = brain

    this.xEdge = xPositions[side].edge
    this.xCenter = xPositions[side].center
    this.xBack = xPositions[side].back

    this.height = controller === 'env' ? boardHeight : height
    this.yTop = boardHeight / 2 - this.height / 2
    this.yBottom = this.yTop + this.height

    this.speed = this.controller === 'ai' ? aiSpeed : playerSpeed
    if (this.controller === 'keys') {
      this.unsubscriber = subscribe(config => {
        this.speed = config.playerSpeed
      })
    }
  }

  destroy = () => {
    this.unsubscriber?.()
  }

  updatePosition = (direction: number) => {
    if (direction === 0) return
    if ((this.yTop <= 0 && direction < 0) || (this.yBottom >= boardHeight && direction > 0)) return
    this.setPosition(this.yTop + direction * this.speed)
  }

  setPosition = (y: number, offsetToPlayerCenter = false) => {
    const yTop = offsetToPlayerCenter ? y - this.height / 2 : y
    this.yTop = Math.max(0, Math.min(boardHeight - this.height, yTop))
    this.yBottom = this.yTop + this.height
  }

  addScore = () => {
    this.score = this.score + 1
  }

  reset = (reposition = true) => {
    this.score = 0
    if (reposition) {
      this.yTop = boardHeight / 2 - this.height / 2
      this.yBottom = this.yTop + this.height
    }
  }
}
