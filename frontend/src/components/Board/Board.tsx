import { FC, useEffect } from 'react'
import { GameSet, PlayerClass, getConfig } from 'classes'
import Player from 'components/Player/Player'
import Ball from 'components/Ball/Ball'
import cx from 'classnames'
import s from './Board.module.css'

const { boardWidth, boardHeight } = getConfig()

type BoardProps = {
  sets: GameSet[]
  leaderSet?: GameSet
  leader?: PlayerClass
}

const Board: FC<BoardProps> = ({ sets, leader, leaderSet }) => {
  useEffect(() => {
    const setScreenRatio = () => {
      const root = document.documentElement
      const widthRatio = root.clientWidth / boardWidth
      const heightRatio = root.clientHeight / boardWidth
      const boardScreenRatio = Math.min(widthRatio, heightRatio)
      root.style.setProperty('--screen-board-ratio', `${boardScreenRatio}`)
    }
    setScreenRatio()
  }, [])

  return (
    <div
      className={cx(s.board, { [s.pointer]: sets[0]?.players[0].controller === 'pointer' })}
      id='board'
    >
      <div className={s.top}></div>
      <div className={s.bottom}></div>
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
