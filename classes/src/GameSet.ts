import { BallClass } from './BallClass'
import { PlayerClass } from './PlayerClass'
import { getConfig } from './config'

const {
  paddleHeight,
  paddleWidth,
  boardPadding,
  maxBounceAngle,
  boardWidth,
  boardHeight,
  ballDiameter,
} = getConfig()

const playerMaxY = boardHeight - paddleHeight
const ballMaxDistance = boardWidth - 2 * (paddleWidth + boardPadding)
const paddleMiddle = paddleHeight / 2
const maxBallIntersectYFromMiddle = paddleMiddle + ballDiameter / 2

export class GameSet {
  ball: BallClass
  players: readonly [PlayerClass, PlayerClass]
  key: string
  dead = false
  survived = false

  constructor(players: readonly [PlayerClass, PlayerClass], key: string) {
    this.players = players
    this.key = key
    this.ball = new BallClass({
      onFail: side => {
        if (side === 'left') {
          this.players[1].addScore()
          this.players[0].stimulate('fail')
          this.players[0].refill()
        } else {
          this.players[0].addScore()
          this.players[1].stimulate('fail')
          this.players[1].refill()
        }
      },
    })
  }

  kill = () => {
    this.dead = true
  }

  tick = () => {
    const {
      ball,
      players: [left, right],
    } = this

    const prevX = ball.x
    ball.update()

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
    } else if (left.controller === 'keys') {
      left.updatePosition(left.keyboardController?.getDirection() || 0)
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
      if (ball.shouldBounced(keeper, prevX)) {
        const bounceAngle = this.getPlayerIntersectAngle(keeper)
        ball.setAngle(bounceAngle)
        keeper.stimulate('bounce')
        left.refill()
        right.refill()
      }
    })
  }

  getPlayerIntersectAngle = (keeper: PlayerClass) => {
    if (keeper.controller === 'env') {
      const { wallMinAngle } = getConfig()
      const wallMinRadAngle = (wallMinAngle / 180) * Math.PI

      const consumeMinAngle = Math.random() > 0.5
      const bounceAngle =
        Math.sign(Math.random() - 0.5) *
        (consumeMinAngle
          ? wallMinRadAngle + (maxBounceAngle - wallMinRadAngle) * Math.random()
          : wallMinRadAngle * Math.random())
      return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
    } else {
      const relativeIntersectY = keeper.yTop + paddleMiddle - this.ball.y
      const bounceAngle = -(relativeIntersectY / maxBallIntersectYFromMiddle) * maxBounceAngle
      return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
    }
  }
}
