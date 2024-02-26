import { PlayerClass, Side } from './PlayerClass'
import { getConfig, subscribe } from './config'

const { boardWidth, boardHeight, ballDiameter, ballSpeed: initSpeed } = getConfig()

const ballRadius = ballDiameter / 2
const initX = boardWidth / 2
const initY = boardHeight / 2
const failLeftLine = -ballRadius
const failRightLine = boardWidth + ballRadius

type BallProps = {
  speed?: number
  onFail: (side: Side) => void
}
const sin45 = 1 / Math.sqrt(2)
const getVxAbs = (speed: number) => speed * sin45

// Make angle as [-PI, +PI]
const normalizeAngle = (angle: number) => {
  const angleLower2Pi = angle % (2 * Math.PI)
  if (angleLower2Pi > Math.PI) return angleLower2Pi - 2 * Math.PI
  if (angleLower2Pi < -Math.PI) return angleLower2Pi + 2 * Math.PI
  return angleLower2Pi
}

// from left to right and vise versa
const mirrorAngle = (angle: number) => {
  return Math.PI - angle
}

export class BallClass {
  serve = true
  x: number = initX
  y: number = initY
  angle: number = 0
  vx: number = 0
  vxPart: number = 0
  xvAbs: number = getVxAbs(initSpeed)
  vy: number = 0
  vyPart: number = 0
  speed: number = getConfig().ballSpeed
  onFail: (side: Side) => void
  unsubscriber: () => void

  constructor({ onFail }: BallProps) {
    this.onFail = onFail

    this.respawn(true)

    this.unsubscriber = subscribe(config => {
      this.speed = config.ballSpeed
      this.xvAbs = getVxAbs(config.ballSpeed)
      this.setAngle(this.angle)
    })
  }

  destroy = () => {
    this.unsubscriber()
  }

  reset = () => {
    this.angle = 0
    this.respawn(true)
  }

  respawn = (center: boolean = false) => {
    this.serve = true
    this.x = initX
    this.y = center ? initY : this.y

    const initAngle = (Math.PI * (Math.random() - 0.5)) / 3
    const mirror = this.angle ? Math.abs(this.angle / Math.PI) > 0.5 : Math.random() > 0.5
    this.setAngle(mirror ? mirrorAngle(initAngle) : initAngle)
  }

  setAngle = (angle: number) => {
    angle = normalizeAngle(angle)
    this.angle = angle
    const cos = Math.cos(angle)

    const xDirection = Math.sign(cos)
    const vxAbs = this.serve ? this.xvAbs / 2.5 : this.xvAbs
    this.vx = xDirection * vxAbs
    const vy = this.speed * Math.sin(angle)
    this.vy = this.serve ? vy / 2.5 : vy

    const realAngle = Math.atan(this.vy / vxAbs)
    this.vxPart = xDirection * Math.cos(realAngle)
    this.vyPart = Math.sin(realAngle)
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
    const offsetSign = player.side === 'left' ? -1 : 1
    const offset = offsetSign * ballRadius

    const ballSidePoint = this.x + offset
    const prevBallSidePoint = prevX + offset

    const sidedIsMore = (a: number, b: number) => (player.side === 'left' ? a > b : a < b)

    if (sidedIsMore(ballSidePoint, player.xEdge)) return
    if (sidedIsMore(player.xEdge, prevBallSidePoint) && sidedIsMore(player.xCenter, ballSidePoint))
      return
    if (player.yTop > this.y + ballRadius || player.yBottom < this.y - ballRadius) return

    this.serve = false
    this.x = player.xEdge - offset - offsetSign
    return true
  }
}
