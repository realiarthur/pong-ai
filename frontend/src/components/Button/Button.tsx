import { FC, ButtonHTMLAttributes } from 'react'
import { useKey } from 'utils/useKey'
import s from './Button.module.css'
import cx from 'classnames'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick: () => void
  keyCode?: string
  preventDefault?: boolean
  active?: boolean
}

const Button: FC<ButtonProps> = ({
  onClick,
  keyCode,
  preventDefault,
  children,
  className,
  ...props
}) => {
  useKey(keyCode, onClick, preventDefault)

  return (
    <button className={cx(s.button, className)} {...props} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button

export const Tab: FC<ButtonProps & { active?: boolean }> = ({ active, ...props }) => {
  return <Button {...props} className={cx(s.tab, { [s.active]: active })}></Button>
}
