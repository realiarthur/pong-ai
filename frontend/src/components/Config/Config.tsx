import { FC, FocusEvent } from 'react'
import { getConfig, setConfig } from 'classes'
import s from './Config.module.css'

const initConfig = getConfig()
type Config = typeof initConfig

const settings: Array<[string, keyof Config]> = [
  ['move', 'moveStimulation'],
  ['bounce', 'bounceStimulation'],
  ['fail', 'failStimulation'],
  ['count', 'population'],
  ['mutation', 'maxMutation'],
]

const Config: FC = () => {
  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    setConfig({ [e.target.name as keyof Config]: +e.target.value })
  }

  return (
    <div className={s.config}>
      {settings.map(([title, key]) => (
        <div key={key} className={s.configItem}>
          <span>{title}</span>
          <input name={key} defaultValue={initConfig[key]} onBlur={onBlur} />
        </div>
      ))}
    </div>
  )
}

export default Config
