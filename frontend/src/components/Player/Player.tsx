import { FC, useLayoutEffect, useRef } from 'react'
import { PlayerClass } from 'classes'
import cx from 'classnames'
import s from './Player.module.css'
import { translateCoordinates } from 'core/setCssConst'

const Player: FC<{ player: PlayerClass; className?: string }> = ({ player, className }) => {
  const { side, xEdge, yTop, controller } = player

  const playerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!playerRef.current) return

    playerRef.current.style.transform = translateCoordinates(xEdge, yTop)
  }, [xEdge, yTop])

  return <div className={cx(s.player, s[side], s[controller], className)} ref={playerRef}></div>
}

export default Player
