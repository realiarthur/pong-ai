import { BallClass } from './BallClass'
import { PlayerClass } from './PlayerClass'
import { getConfig } from './config'

const { paddleHeight, maxBounceAngle, boardWidth, boardHeight } = getConfig()

const playerMaxY = boardHeight - paddleHeight

const getBounceStimulation = (bounceAngle: number) => {
  const { move, moveEnvFinal } = getConfig()
  return 1 + (0.5 * ((move / moveEnvFinal) * bounceAngle)) / maxBounceAngle
}

const getMiddleStimulation = (y: number) => 1 / (1 + 100 * Math.pow(y - 0.5, 2)) - 0.1

export class GameSet {
  ball: BallClass
  players: readonly [PlayerClass, PlayerClass]
  key: string
  dead = false

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

  // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl

  tick = () => {
    const {
      ball,
      players: [left, right],
    } = this

    const { x: prevX, y: prevY } = ball
    ball.update()

    // ['ΔX', 'pY', 'bY', "bVx'", 'bVy', 'e']

    if (left.brain) {
      const scaledPlayerY = left.yTop / playerMaxY
      left.stimulate('middle', getMiddleStimulation(scaledPlayerY))

      const direction = left.brain.calculate([
        (ball.x - left.xEdge) / boardWidth,
        scaledPlayerY,
        ball.y / boardHeight,
        // ball.angleLeft,
        ball.vxPart,
        ball.vyPart,
        // left.energy,
      ])

      left.updatePosition(direction)
    }

    if (right.brain) {
      const scaledPlayerY = right.yTop / playerMaxY
      right.stimulate('middle', getMiddleStimulation(scaledPlayerY))

      const direction = right.brain.calculate([
        (right.xEdge - ball.x) / boardWidth,
        scaledPlayerY,
        ball.y / boardHeight,
        // ball.angleRight,
        -ball.vxPart,
        ball.vyPart,
        // right.energy,
      ])

      right.updatePosition(direction)
    }

    const getPlayerIntersectAngle = (keeper: PlayerClass) => {
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
      }
      const relativeIntersectY = keeper.yTop + keeper.height / 2 - this.ball.y
      const bounceAngle = -(relativeIntersectY / (keeper.height / 2)) * maxBounceAngle
      return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle
    }

    if (ball.shouldBounced(left, prevX)) {
      const bounceAngle = getPlayerIntersectAngle(left)
      ball.setAngle(bounceAngle)
      left.stimulate('bounce', getBounceStimulation(bounceAngle))
      left.refill()
      right.refill()
    }

    if (ball.shouldBounced(right, prevX)) {
      const bounceAngle = getPlayerIntersectAngle(right)
      ball.setAngle(bounceAngle)
      right.stimulate('bounce', getBounceStimulation(bounceAngle))
      left.refill()
      right.refill()
    }
  }
}
