import { FC, useLayoutEffect, useRef } from 'react'
import { BallClass } from 'classes'
import cx from 'classnames'
import s from './Ball.module.css'
import { translateCoordinates } from 'utils/setCssConst'

const Ball: FC<{ ball: BallClass; className?: string }> = ({ ball: { x, y }, className }) => {
  const ball = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ball.current) return

    ball.current.style.transform = translateCoordinates(x, y)
  }, [x, y])

  return <div className={cx(s.ball, className)} ref={ball}></div>
}

export default Ball
