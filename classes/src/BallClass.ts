import { PlayerClass, Side } from './PlayerClass'
import { getConfig, subscribe } from './config'
import { randomBoolean, signRandom } from './utils/random'

const { boardWidth, boardHeight, ballDiameter, ballSpeed: initSpeed } = getConfig()

const ballRadius = ballDiameter / 2
const initX = boardWidth / 2
const initY = boardHeight / 2
const failLeftLine = -ballRadius
const failRightLine = boardWidth + ballRadius
const sin45 = 1 / Math.sqrt(2)

const minBallY = ballRadius
const maxBallY = boardHeight - ballRadius

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

type BallProps = {
  speed?: number
  onFail: (side: Side) => void
}
export class BallClass {
  serve = true
  x = initX
  y = initY
  angle = 0
  vx = 0
  vxPart = 0
  xvAbs = getVxAbs(initSpeed)
  vy = 0
  vyPart = 0
  speed = initSpeed
  onFail: (side: Side) => void
  unsubscriber: () => void

  constructor({ onFail }: BallProps) {
    this.onFail = onFail
    this.respawn(true)

    this.unsubscriber = subscribe(config => {
      this.speed = config.ballSpeed
      this.xvAbs = getVxAbs(config.ballSpeed)
      this.setSpeed()
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

    const initAngle = (Math.PI * signRandom()) / 6
    const mirror = this.angle ? Math.abs(this.angle / Math.PI) > 0.5 : randomBoolean()
    this.setAngle(initAngle, mirror)
  }

  setAngle = (angle: number, mirror = false) => {
    if (mirror) {
      angle = mirrorAngle(angle)
    }
    this.angle = normalizeAngle(angle)
    this.setSpeed()
  }

  setSpeed = () => {
    const speedCoefficient = this.serve ? 0.4 : 1
    const cos = Math.cos(this.angle)

    const xDirection = Math.sign(cos)
    const vxAbs = this.xvAbs * speedCoefficient
    this.vx = xDirection * vxAbs
    this.vy = this.speed * Math.sin(this.angle) * speedCoefficient

    const realAngle = Math.atan(this.vy / vxAbs)
    this.vxPart = xDirection * Math.cos(realAngle)
    this.vyPart = Math.sin(realAngle)
  }

  tick = () => {
    // Y
    if (this.y - ballRadius <= 0 || this.y + ballRadius >= boardHeight) {
      this.setAngle(-this.angle)
    }

    this.y = Math.max(minBallY, Math.min(this.y + this.vy, maxBallY))

    // X
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
}
