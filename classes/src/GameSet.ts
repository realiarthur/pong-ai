import { BallClass } from './BallClass'
import { Direction, PlayerClass } from './PlayerClass'
import { getConfig } from './config'
import { uid } from 'uid'

const { paddleHeight, maxBounceAngle, boardWidth, boardHeight, paddleWidth, boardPadding } =
  getConfig()

const playerMaxY = boardHeight - paddleHeight
const maxBallDistance = boardWidth - 2 * (paddleWidth + boardPadding)

export class GameSet {
  uid = uid()
  ball: BallClass
  players: readonly [PlayerClass, PlayerClass]

  constructor(players: readonly [PlayerClass, PlayerClass], ball: BallClass) {
    this.players = players
    this.ball = ball
  }

  // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
  getPlayerIntersectAngle(keeper: PlayerClass) {
    if (keeper.controller === 'wall') {
      return 2 * (Math.random() - 0.5) * maxBounceAngle
    }
    const relativeIntersectY = keeper.yTop + keeper.height / 2 - this.ball.y
    const bounceAngle = -(relativeIntersectY / (keeper.height / 2)) * maxBounceAngle
    return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
  }

  tick = () => {
    const {
      ball,
      players: [left, right],
    } = this

    if (left.brain) {
      const [direction] = left.brain.calculate([
        left.yTop / playerMaxY,
        (ball.x - left.xEdge) / maxBallDistance,
        ball.y / boardHeight,
        ball.angleCos,
        ball.angleSin,
      ]) as [Direction]

      left.updatePosition(direction)
    }

    if (right.brain) {
      const [direction] = right.brain.calculate([
        right.yTop / playerMaxY,
        (right.xEdge - ball.x) / maxBallDistance,
        this.ball.y / boardHeight,
        -ball.angleCos,
        ball.angleSin,
      ]) as [Direction]

      right.updatePosition(direction)
    }

    if (this.ball.shouldBounced(left)) {
      const bounceAngle = this.getPlayerIntersectAngle(left)
      this.ball.setAngle(bounceAngle)
      left.stimulate('bounce')
    }

    if (this.ball.shouldBounced(right)) {
      const bounceAngle = this.getPlayerIntersectAngle(right)
      this.ball.setAngle(bounceAngle)
      right.stimulate('bounce')
    }
  }
}
