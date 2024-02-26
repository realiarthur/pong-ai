import { FC, useEffect, useLayoutEffect, useRef } from 'react'
import { getConfig, PlayerClass } from 'classes'
import cx from 'classnames'
import s from './Player.module.css'

const { KEYBOARD_REPEAT_TIMEOUT } = getConfig()

const Player: FC<{ player: PlayerClass; className?: string }> = ({
  player: { side, xEdge, yTop, controller, updatePosition },
  className,
}) => {
  const player = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!player.current) return

    player.current.style.transform = `translate(${xEdge}px, ${yTop}px)`
  }, [xEdge, yTop])

  return <div className={cx(s.player, s[side], s[controller], className)} ref={player}></div>
}

export default Player
