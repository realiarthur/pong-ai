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
  x: number = -ballDiameter
  y: number = -ballDiameter
  angle: number = 0
  angleLeft: number = 0
  angleRight: number = 0
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
    })
  }

  destroy = () => {
    this.unsubscriber()
  }

  respawn = (center: boolean = false) => {
    this.serve = true
    this.x = initX
    this.y = center ? initY : this.y ?? Math.random() * boardHeight
    if (this.angle) {
      this.setAngle((this.angle + 0.2) * 1.2)
    } else {
      const initAngle = (Math.PI * (Math.random() - 0.5)) / 1.5
      const mirror = Math.sign(Math.random() - 0.5) > 0
      this.setAngle(mirror ? mirrorAngle(initAngle) : initAngle)
    }
  }

  setAngle = (angle: number) => {
    angle = normalizeAngle(angle)
    this.angle = angle
    const cos = Math.cos(angle)

    this.angleLeft = angle / Math.PI
    this.angleRight = normalizeAngle(mirrorAngle(angle)) / Math.PI

    const xDirection = Math.sign(cos)
    const vx = xDirection * this.xvAbs
    this.vx = this.serve ? vx / 2 : vx
    this.vxPart = xDirection * sin45
    const vy = this.speed * Math.sin(angle)
    this.vy = this.serve ? vy / 2.5 : vy
    this.vyPart = Math.sin(angle)
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
