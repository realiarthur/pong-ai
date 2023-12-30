import { FC } from 'react'
import { GameSet, PlayerClass } from 'classes'
import Player from 'components/Player/Player'
import Ball from 'components/Ball/Ball'
import cx from 'classnames'
import s from './Board.module.css'

type BoardProps = {
  sets: GameSet[]
  leader?: PlayerClass
}

const Board: FC<BoardProps> = ({ sets, leader }) => {
  return (
    <div className={s.board}>
      {/* TODOC key */}
      {sets.map(({ players, ball }, index) => (
        <div key={index} className={cx(s.gameSet, { [s.leader]: players[1] === leader })}>
          {players.map((player, index) => (
            <Player key={index} player={player} />
          ))}
          <Ball key={index} ball={ball} />
        </div>
      ))}
    </div>
  )
}

export default Board
