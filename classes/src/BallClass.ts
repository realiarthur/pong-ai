import { PlayerClass, Side } from './PlayerClass'
import { config } from './config'

const { boardWidth, boardHeight, ballSpeed, ballRadius } = config

const halfBallWidth = ballRadius / 2
const initX = boardWidth / 2 - halfBallWidth
const initY = boardHeight / 2 - halfBallWidth
const failLeftLine = -halfBallWidth
const failRightLine = boardWidth + halfBallWidth

type BallProps = {
  speed?: number
  onFail: (side: Side) => void
}

export class BallClass {
  x: number = -ballRadius
  y: number = -ballRadius
  angle: number = 0
  vx: number = 0
  vy: number = 0
  speed: number = ballSpeed
  onFail: (side: Side) => void

  constructor({ onFail, speed = ballSpeed }: BallProps) {
    this.onFail = onFail
    this.speed = speed

    this.respawn()
  }

  respawn = () => {
    this.x = initX
    this.y = initY
    const initAngle =
      ((Math.random() - 0.5) / 1.5) * Math.PI + (Math.sign(Math.random() - 0.5) > 0 ? Math.PI : 0)
    this.setAngle(initAngle)
  }

  setAngle = (angle: number) => {
    this.angle = angle
    this.vx = this.speed * Math.cos(angle)
    this.vy = this.speed * Math.sin(angle)
  }

  update = () => {
    // y
    if (this.y - halfBallWidth <= 0 || this.y + halfBallWidth >= boardHeight) {
      this.vy = -this.vy
    }

    this.y = this.y + this.vy

    // if (this.y < 0) this.y = 0
    // if (this.y + ballRadius > boardHeight) this.y = boardHeight - ballRadius

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

  shouldBounced = (player: PlayerClass) => {
    if (!(player.yTop <= this.y + halfBallWidth && player.yBottom >= this.y - halfBallWidth)) return

    if (player.side === 'left') {
      return this.x - halfBallWidth <= player.xEdge && !(this.x < player.xFail)
    } else {
      return this.x + halfBallWidth >= player.xEdge && !(this.x + halfBallWidth > player.xFail)
    }
  }
}
