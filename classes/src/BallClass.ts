import { PlayerClass, Side } from './PlayerClass'
import { getConfig, subscribe } from './config'

const { boardWidth, boardHeight, ballDiameter } = getConfig()

const ballRadius = ballDiameter / 2
const initX = boardWidth / 2
const initY = boardHeight / 2
const failLeftLine = -ballRadius
const failRightLine = boardWidth + ballRadius

type BallProps = {
  speed?: number
  onFail: (side: Side) => void
}

export class BallClass {
  serve = true
  x: number = -ballDiameter
  y: number = -ballDiameter
  angle: number = 0
  angleCos: number = 0
  angleSin: number = 0
  vx: number = 0
  vy: number = 0
  speed: number = getConfig().ballSpeed
  onFail: (side: Side) => void
  unsubscriber: () => void

  constructor({ onFail }: BallProps) {
    this.onFail = onFail

    this.respawn(true)

    this.unsubscriber = subscribe(config => {
      this.speed = config.ballSpeed
    })
  }

  destroy = () => {
    this.unsubscriber()
  }

  respawn = (center: boolean = false) => {
    this.serve = true
    this.x = initX
    this.y = center ? initY : Math.random() * boardHeight
    const initAngle =
      ((Math.random() - 0.5) / 1.5) * Math.PI + (Math.sign(Math.random() - 0.5) > 0 ? Math.PI : 0)
    this.setAngle(initAngle)
  }

  setAngle = (angle: number) => {
    this.angle = angle
    this.angleCos = Math.cos(angle)
    this.angleSin = Math.sin(angle)
    this.vx = (this.serve ? this.speed / 2.5 : this.speed) * this.angleCos
    this.vy = (this.serve ? this.speed / 2.5 : this.speed) * this.angleSin
  }

  update = () => {
    // y
    if (this.y - ballRadius <= 0 || this.y + ballRadius >= boardHeight) {
      this.setAngle(-this.angle)
    }

    this.y = this.y + this.vy

    if (this.y - ballRadius < 0) this.y = ballRadius
    if (this.y + ballRadius > boardHeight) this.y = boardHeight - ballRadius

    // x
    this.x = this.x + this.vx

    if (this.x <= failLeftLine) {
      this.onFail('left')
      this.respawn()
    }
    if (this.x >= failRightLine) {
      this.onFail('right')
      this.respawn()
    }
  }

  shouldBounced = (player: PlayerClass, prevX: number) => {
    if (!(player.yTop <= this.y + ballRadius && player.yBottom >= this.y - ballRadius)) return

    let shouldBounce = false
    if (player.side === 'left') {
      shouldBounce =
        this.x - ballRadius <= player.xEdge &&
        (!(this.x < player.xFail) || prevX - ballRadius > player.xEdge)
    } else {
      shouldBounce =
        this.x + ballRadius >= player.xEdge &&
        (!(this.x > player.xFail) || prevX + ballRadius < player.xEdge)
    }

    if (shouldBounce) {
      this.serve = false
      this.x = player.xEdge + (player.side === 'left' ? ballRadius : -ballRadius)
    }

    return shouldBounce
  }
}
