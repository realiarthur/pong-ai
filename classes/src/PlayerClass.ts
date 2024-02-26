import { Intelligence } from './Intelligence'
import { KeyboardController } from './KeyboardController'
import { getConfig, Config, StimulateType, subscribe } from './config'

const { paddleWidth, paddleHeight, boardWidth, boardHeight, playerSpeed, boardPadding } =
  getConfig()

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
  xCenter: number
  xBack: number
  yTop: number
  yBottom: number
  height: number = paddleHeight
  controller: Controller
  brain?: Intelligence
  score: number = 0
  stimulation: number = 0
  energy = 1
  previousDirection = -1 | 1
  keyboardController?: KeyboardController
  unsubscriber?: () => void
  speed: number = playerSpeed

  constructor({ side, height = paddleHeight, controller = 'keys', brain }: PlayerClassProps) {
    this.side = side
    this.xEdge =
      side === 'left' ? paddleWidth + boardPadding : boardWidth - paddleWidth - boardPadding
    this.xCenter = side === 'left' ? this.xEdge - paddleWidth / 2 : this.xEdge + paddleWidth / 2
    this.xBack = side === 'left' ? this.xEdge - paddleWidth : this.xEdge + paddleWidth
    this.height = controller === 'env' ? boardHeight : height
    this.yTop = boardHeight / 2 - this.height / 2
    this.yBottom = this.yTop + this.height
    this.controller = controller
    this.brain = brain

    if (controller === 'keys') {
      this.keyboardController = new KeyboardController()
    }

    this.unsubscriber = subscribe(config => {
      this.speed = this.controller === 'ai' ? config.aiSpeed : config.playerSpeed
    })
  }

  destroy = () => {
    this.unsubscriber?.()
    this.keyboardController?.destroy()
  }

  refill = () => {
    this.energy = 1
  }

  updatePosition = (direction: number) => {
    if (direction === 0) return

    if ((this.yTop <= 0 && direction < 0) || (this.yBottom >= boardHeight && direction > 0)) return

    this.yTop = Math.max(0, Math.min(boardHeight - this.height, this.yTop + direction * this.speed))
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

  reset = (reposition = true) => {
    this.score = 0
    this.stimulation = 0
    if (reposition) {
      this.yTop = boardHeight / 2 - this.height / 2
      this.yBottom = this.yTop + this.height
    }
  }
}
