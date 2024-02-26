import { FC, ButtonHTMLAttributes } from 'react'
import { useKey } from 'utils/useKey'
import s from './Button.module.css'
import cx from 'classnames'
import { track } from 'utils/amplitude'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick: () => void
  keyCode?: string
  preventDefault?: boolean
  active?: boolean
  trackId: string
}

const Button: FC<ButtonProps> = ({
  onClick,
  keyCode,
  preventDefault,
  children,
  className,
  trackId,
  ...props
}) => {
  const handleClick = () => {
    if (trackId) {
      track('BUTTON', { trackId })
    }
    onClick()
  }

  useKey(keyCode, handleClick, preventDefault)

  return (
    <button className={cx(s.button, className)} {...props} onClick={handleClick}>
      {children}
    </button>
  )
}

export default Button

export const Tab: FC<ButtonProps & { active?: boolean }> = ({ active, ...props }) => {
  return <Button {...props} className={cx(s.tab, { [s.active]: active })} />
}
