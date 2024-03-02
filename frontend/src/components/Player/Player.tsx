import { FC, useEffect, useLayoutEffect, useRef } from 'react'
import { getConfig, PlayerClass } from 'classes'
import cx from 'classnames'
import s from './Player.module.css'
import { boardScreenRatio, translateCoordinates } from 'utils/setCssConst'

const Player: FC<{ player: PlayerClass; className?: string }> = ({ player, className }) => {
  const { side, xEdge, yTop, controller } = player

  usePointerController(player)

  const playerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!playerRef.current) return

    playerRef.current.style.transform = translateCoordinates(xEdge, yTop)
  }, [xEdge, yTop])

  return <div className={cx(s.player, s[side], s[controller], className)} ref={playerRef}></div>
}

export default Player

const usePointerController = (player: PlayerClass) => {
  useEffect(() => {
    if (player.controller !== 'pointer') return
    const board = document.getElementById('board')

    if (!board) return

    const move = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      // @ts-ignore
      const y = e.layerY
      if (y) {
        player.setPosition(y / boardScreenRatio, true)
      }
    }

    board.addEventListener('touchmove', move)
    board.addEventListener('mousemove', move)

    return () => {
      board.removeEventListener('touchmove', move)
      board.removeEventListener('mousemove', move)
    }
  }, [player.controller])
}
