import { FC } from 'react'
import cx from 'classnames'

import { GameSet, PlayerClass } from 'classes'
import Player from 'components/Player/Player'
import Ball from 'components/Ball/Ball'

import s from './Board.module.css'

type BoardProps = {
  sets: GameSet[]
  leaderSet?: GameSet
  leader?: PlayerClass
  hasPointer: boolean
}

const Board: FC<BoardProps> = ({ sets, leader, leaderSet, hasPointer }) => {
  return (
    <div className={cx(s.board, { [s.pointer]: hasPointer })} id='board'>
      <div className={s.topBorder}></div>
      <div className={s.bottomBorder}></div>
      {sets.map(set => {
        const { players, ball, key } = set
        const hasLeader = set === leaderSet
        return (
          <div
            key={key}
            className={cx(s.gameSet, {
              [s.leaderBoard]: hasLeader,
              [s.one]: sets.length === 1,
            })}
          >
            {players.map((player, index) => {
              if (player.controller !== 'ai' && index > 0) return

              return (
                <Player
                  key={index}
                  player={player}
                  className={cx({
                    [s.leaderEnemy]: hasLeader && player !== leader && player.controller !== 'env',
                    [s.leader]: player === leader,
                  })}
                />
              )
            })}
            <Ball ball={ball} className={cx({ [s.leader]: hasLeader })} />
          </div>
        )
      })}
    </div>
  )
}

export default Board
