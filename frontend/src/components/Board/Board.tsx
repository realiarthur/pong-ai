import { FC } from 'react'
import { GameSet, PlayerClass } from 'classes'
import Player from 'components/Player/Player'
import Ball from 'components/Ball/Ball'
import cx from 'classnames'
import s from './Board.module.css'

type BoardProps = {
  sets: GameSet[]
  leaderSet?: GameSet
  leader?: PlayerClass
}

const Board: FC<BoardProps> = ({ sets, leader, leaderSet }) => {
  return (
    <div className={s.board}>
      {sets.map(set => {
        const { players, ball, uid } = set
        const hasLeader = set === leaderSet
        return (
          <div
            key={uid}
            className={cx(s.gameSet, {
              [s.leaderBoard]: hasLeader,
            })}
          >
            {players.map((player, index) => (
              <Player
                key={index}
                player={player}
                className={cx({
                  [s.leaderEnemy]: hasLeader && player !== leader && player.controller !== 'wall',
                  [s.leader]: player === leader,
                })}
              />
            ))}
            <Ball ball={ball} className={cx({ [s.leader]: hasLeader })} />
          </div>
        )
      })}
    </div>
  )
}

export default Board
