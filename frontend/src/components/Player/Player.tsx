import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { config, PlayerClass } from 'classes'
import cx from 'classnames'
import s from './Player.module.css'

const CONTROLLER_TIMEOUT = 10

const Player: FC<{ player: PlayerClass }> = ({
  player: { side, xEdge, yTop, controller, updatePosition },
}) => {
  const player = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!player.current) return

    player.current.style.transform = `translate(${xEdge}px, ${yTop}px)`
  }, [xEdge, yTop])

  useEffect(() => {
    if (controller !== 'keyboard') return
    const keyboardController = () => {
      let timer: NodeJS.Timeout | null = null
      return [
        ({ code }: KeyboardEvent) => {
          if (timer) return

          const upKey = side === 'left' ? 'KeyW' : 'ArrowUp'
          const downKey = side === 'left' ? 'KeyS' : 'ArrowDown'
          if (code === upKey) {
            timer = setInterval(() => updatePosition(-1), CONTROLLER_TIMEOUT)
          }
          if (code === downKey) {
            timer = setInterval(() => updatePosition(1), CONTROLLER_TIMEOUT)
          }
        },
        () => {
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
        },
      ] as const
    }
    const [handle, cancel] = keyboardController()
    window.addEventListener('keydown', handle)
    window.addEventListener('keyup', cancel)

    return () => {
      cancel()
      window.removeEventListener('keydown', handle)
      window.removeEventListener('keyup', cancel)
    }
  }, [controller])

  return <div className={cx(s.player, s[side])} ref={player}></div>
}

export default Player
