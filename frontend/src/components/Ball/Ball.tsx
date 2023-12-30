import { FC, useLayoutEffect, useRef } from 'react'
import { BallClass, config } from 'classes'
import cx from 'classnames'
import s from './Ball.module.css'

const Ball: FC<{ ball: BallClass }> = ({ ball: { x, y } }) => {
  const ball = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ball.current) return

    ball.current.style.transform = `translate(${x}px, ${y}px)`
  }, [x, y])

  return <div className={cx(s.ball)} ref={ball}></div>
}

export default Ball
