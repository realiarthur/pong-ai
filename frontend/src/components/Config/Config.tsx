import { FC, FocusEvent, useEffect, useState } from 'react'
import { getConfig, setConfig, Config as ConfigType, subscribe } from 'classes'
import s from './Config.module.css'

const initConfig = getConfig()

type Fields = Array<[string, keyof ConfigType]>

const Config: FC<{ fields: Fields }> = ({ fields }) => {
  const [valuesKey, setValuesKey] = useState(0)
  const [values, setValues] = useState(initConfig)

  useEffect(() => {
    subscribe(config => {
      setValuesKey(k => k + 1)
      setValues(config)
    })
  })

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    setConfig({ [e.target.name as keyof ConfigType]: +e.target.value })
  }

  return (
    <div className={s.config} key={valuesKey}>
      {fields.map(([title, key]) => (
        <div key={key} className={s.configItem}>
          <span>{title}</span>
          <input name={key} defaultValue={values[key]} onBlur={onBlur} />
        </div>
      ))}
    </div>
  )
}

export default Config
