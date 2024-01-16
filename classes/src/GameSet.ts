import { BallClass } from './BallClass'
import { Direction, PlayerClass } from './PlayerClass'
import { getConfig } from './config'

const { paddleHeight, maxBounceAngle, boardWidth, boardHeight } = getConfig()

const playerMaxY = boardHeight - paddleHeight

const getBounceStimulation = (bounceAngle: number) => {
  const { move, moveEnvFinal } = getConfig()
  return 1 + (0.5 * ((move / moveEnvFinal) * bounceAngle)) / maxBounceAngle
}

export class GameSet {
  ball: BallClass
  players: readonly [PlayerClass, PlayerClass]
  key: string
  dead = false

  constructor(players: readonly [PlayerClass, PlayerClass], ball: BallClass, key: string) {
    this.players = players
    this.ball = ball
    this.key = key
  }

  kill = () => {
    this.dead = true
  }

  // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl

  tick = () => {
    const {
      ball,
      players: [left, right],
    } = this

    const { x: prevX, y: prevY } = ball
    ball.update()

    //  player.yTop,
    //  |player.xEdge|
    //  ball.|x|',
    //  ball.|x|,
    //  ball.y',
    //  ball.y,

    if (left.brain) {
      const [direction] = left.brain.calculate([
        left.xEdge / boardWidth,
        left.yTop / playerMaxY,
        ball.x / boardWidth,
        ball.y / boardHeight,
      ]) as [Direction]

      left.updatePosition(direction)
    }

    if (right.brain) {
      const [direction] = right.brain.calculate([
        (boardWidth - right.xEdge) / boardWidth,
        right.yTop / playerMaxY,
        (boardWidth - ball.x) / boardWidth,
        ball.y / boardHeight,
      ]) as [Direction]

      right.updatePosition(direction)
    }

    const getPlayerIntersectAngle = (keeper: PlayerClass) => {
      if (keeper.controller === 'env') {
        const { wallMinAngle } = getConfig()
        const wallMinRadAngle = (wallMinAngle / 180) * Math.PI

        const bounceAngle =
          (wallMinRadAngle + (maxBounceAngle - wallMinRadAngle) * Math.random()) *
          (Math.random() > 0.5 ? 1 : -1)
        return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
      }
      const relativeIntersectY = keeper.yTop + keeper.height / 2 - this.ball.y
      const bounceAngle = -(relativeIntersectY / (keeper.height / 2)) * maxBounceAngle
      return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
    }

    if (ball.shouldBounced(left, prevX)) {
      const bounceAngle = getPlayerIntersectAngle(left)
      ball.setAngle(bounceAngle)
      left.stimulate('bounce', getBounceStimulation(bounceAngle))
    }

    if (ball.shouldBounced(right, prevX)) {
      const bounceAngle = getPlayerIntersectAngle(right)
      ball.setAngle(bounceAngle)
      right.stimulate('bounce', getBounceStimulation(bounceAngle))
    }
  }
}
