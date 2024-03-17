import { BallClass } from './BallClass'
import { PlayerClass } from './PlayerClass'
import { getConfig } from './config'
import { lerp } from './utils/collisionDetector'
import { randomBoolean, randomSign } from './utils/random'

const {
  paddleHeight,
  paddleWidth,
  boardPadding,
  maxBounceAngle,
  boardWidth,
  boardHeight,
  ballDiameter,
} = getConfig()

const ballRadius = ballDiameter / 2
const playerMaxY = boardHeight - paddleHeight
const ballMaxDistance = boardWidth - 2 * (paddleWidth + boardPadding)
const paddleMiddle = paddleHeight / 2
const maxBallIntersectYFromMiddle = paddleMiddle + ballRadius

export class GameSet {
  ball: BallClass
  players: readonly [PlayerClass, PlayerClass]
  key: string
  dead = false

  constructor(players: readonly [PlayerClass, PlayerClass], onScore?: (set: GameSet) => void) {
    this.key = `${players[0].brain?.key || players[0].controller}-${
      players[1].brain?.key || players[1].controller
    }`

    this.players = players

    this.ball = new BallClass({
      onFail: side => {
        if (side === 'left') {
          this.players[1].addScore()
        } else {
          this.players[0].addScore()
        }
        onScore?.(this)
      },
    })
    onScore?.(this)
  }

  getWinner = () => {
    const [left, right] = this.players
    return left.score < right.score ? right : left
  }

  reset = () => {
    this.players.forEach(player => player.reset())
    this.ball.reset()
  }

  tick = () => {
    const {
      ball,
      players: [left, right],
    } = this

    const prevX = ball.x
    ball.tick()

    const scaledBallY = ball.y / boardHeight

    if (left.brain) {
      const direction = left.brain.calculate([
        left.yTop / playerMaxY,
        (ball.x - left.xCenter) / ballMaxDistance,
        scaledBallY,
        ball.vxPart,
        ball.vyPart,
      ])

      left.updatePosition(direction)
    }

    if (right.brain) {
      const direction = right.brain.calculate([
        right.yTop / playerMaxY,
        (right.xCenter - ball.x) / ballMaxDistance,
        scaledBallY,
        -ball.vxPart,
        ball.vyPart,
      ])

      right.updatePosition(direction)
    }

    this.players.forEach(keeper => {
      if (this.shouldBounced(keeper, prevX)) {
        const bounceAngle = this.getBounceAngleAbs(keeper)
        ball.setAngle(bounceAngle, keeper.side === 'right')
      }
    })
  }

  shouldBounced = (player: PlayerClass, prevX: number) => {
    const { ball } = this
    const offsetSign = player.side === 'left' ? -1 : 1
    const offset = offsetSign * ballRadius

    const ballSidePoint = ball.x + offset
    const prevBallSidePoint = prevX + offset

    const sidedIsMore = (a: number, b: number) => (player.side === 'left' ? a > b : a < b)

    if (sidedIsMore(ballSidePoint, player.xEdge)) return false
    if (sidedIsMore(player.xEdge, prevBallSidePoint) && sidedIsMore(player.xCenter, ballSidePoint))
      return false
    if (player.yTop > ball.y + ballRadius || player.yBottom < ball.y - ballRadius) return false

    ball.serve = false
    ball.x = player.xEdge - offset - offsetSign
    return true
  }

  getBounceAngleAbs = (keeper: PlayerClass) => {
    if (keeper.controller === 'env') {
      const { wallMinAngle } = getConfig()
      const wallMinRadAngle = (wallMinAngle / 180) * Math.PI

      const consumeMinAngle = randomBoolean()
      const angleSign = randomSign()
      const bounceAngle =
        angleSign *
        (consumeMinAngle
          ? lerp(wallMinRadAngle, maxBounceAngle, Math.random())
          : maxBounceAngle * Math.random())
      return bounceAngle
    }

    const relativeIntersectY = keeper.yTop + paddleMiddle - this.ball.y
    const bounceAngle = -(relativeIntersectY / maxBallIntersectYFromMiddle) * maxBounceAngle
    return bounceAngle
  }
}
