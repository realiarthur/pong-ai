import { BallClass } from './BallClass'
import { Weights } from './Intelligence'
import { Controller, Direction, PlayerClass } from './PlayerClass'
import { config } from './config'

const { paddleHeight, maxBounceAngle } = config

export class GameSet {
  ball: BallClass
  players: [PlayerClass, PlayerClass]

  constructor(
    leftController: Controller = 'keyboard',
    rightController: Controller = 'ai',
    dna?: Weights,
  ) {
    this.players = [
      new PlayerClass({
        side: 'left',
        controller: leftController,
        dna: leftController === 'ai' ? dna : undefined,
      }),
      new PlayerClass({
        side: 'right',
        controller: rightController,
        dna: rightController === 'ai' ? dna : undefined,
      }),
    ]
    this.ball = new BallClass({
      onFail: side => {
        const player = side === 'left' ? this.players[0] : this.players[1]
        player.stimulate(-300)
      },
    })
  }

  // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
  getPlayerIntersectAngle(keeper: PlayerClass) {
    const relativeIntersectY = keeper.yTop + paddleHeight / 2 - this.ball.y
    const bounceAngle = -(relativeIntersectY / (paddleHeight / 2)) * maxBounceAngle
    return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
  }

  tick = () => {
    const {
      ball,
      players: [left, right],
    } = this

    if (left.brain) {
      const [up, down] = left.brain.calculate([
        left.yTop,
        ball.x - left.xEdge,
        ball.y,
        ball.vx,
        ball.vy,
      ])

      const direction = down - up > 0 ? 1 : -1 // TODOC

      left.updatePosition(direction)
    }

    if (right.brain) {
      const [up, down] = right.brain.calculate([
        right.yTop,
        right.xEdge - ball.x,
        this.ball.y,
        -this.ball.vx,
        this.ball.vy,
      ])

      const direction = down - up > 0 ? 1 : -1 // TODOC

      right.updatePosition(direction)
    }

    if (this.ball.shouldBounced(left)) {
      const bounceAngle = this.getPlayerIntersectAngle(left)
      this.ball.setAngle(bounceAngle)
      left.stimulate(100)
    }

    if (this.ball.shouldBounced(right)) {
      const bounceAngle = this.getPlayerIntersectAngle(right)
      this.ball.setAngle(bounceAngle)
      right.stimulate(100)
    }

    this.ball.update()
  }
}
