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

  useEffect(() => {
    if (controller !== 'keys') return
    const keyboardController = () => {
      let timer: NodeJS.Timeout | null = null
      return [
        ({ code }: KeyboardEvent) => {
          if (timer) return

          const upKey = side === 'left' ? 'KeyW' : 'ArrowUp'
          const downKey = side === 'left' ? 'KeyS' : 'ArrowDown'
          if (code === upKey) {
            timer = setInterval(() => updatePosition(-1), KEYBOARD_REPEAT_TIMEOUT)
          }
          if (code === downKey) {
            timer = setInterval(() => updatePosition(1), KEYBOARD_REPEAT_TIMEOUT)
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

  return <div className={cx(s.player, s[side], s[controller], className)} ref={player}></div>
}

export default Player
