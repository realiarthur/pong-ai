import { FC, FocusEvent, useEffect, useState } from 'react'
import { getConfig, setConfig, Config, subscribe, StimulateType, envConfig } from 'classes'
import s from './Environment.module.css'

const initConfig = getConfig()

export type EnvFields = Array<[string, Array<keyof Config>] | ['_header', Array<string>]>

const Environment: FC<{ fields: EnvFields }> = ({ fields }) => {
  const [valuesKey, setValuesKey] = useState(0)
  const [values, setValues] = useState(initConfig)

  useEffect(() => {
    return subscribe((config, updater) => {
      if (updater === 'ui') return
      setValuesKey(k => k + 1)
      setValues(config)
    })
  }, [])

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    setConfig({ [e.target.name as keyof Config]: +e.target.value }, 'ui')
  }

  return (
    <div className={s.config} key={valuesKey}>
      {fields.map(([title, keys], index) => {
        return (
          <div key={title + index} className={s.configItem}>
            <span className={s.name}>{title === '_header' ? '' : title}</span>
            {title === '_header' ? (
              <>
                {keys.map((header, index) => (
                  <span key={index} className={s.title}>
                    {header}
                  </span>
                ))}
              </>
            ) : (
              <>
                {keys.map(key => (
                  <input
                    key={key}
                    name={key}
                    defaultValue={values[key as keyof Config]}
                    onBlur={onBlur}
                    autoComplete='off'
                  />
                ))}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Environment
