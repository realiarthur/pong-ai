import { FC, FocusEvent, useEffect, useState } from 'react'
import { getConfig, setConfig, Config, subscribe, StimulateType, envConfig } from 'classes'
import s from './Config.module.css'

const initConfig = getConfig()

export type EnvFields = Array<[string, keyof Config]>

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

  let tabIndex = -1

  return (
    <div className={s.config} key={valuesKey}>
      <div className={s.configItem}>
        <span className={s.name}></span>
        <span className={s.title}>current</span>
        <span className={s.title}>step</span>
        <span className={s.title}>final</span>
      </div>

      {fields.map(([title, key]) => {
        const isEnv = envConfig.includes(key as StimulateType)
        tabIndex = tabIndex + (isEnv ? 3 : 1)
        return (
          <div key={key} className={s.configItem}>
            <span className={s.name}>{title}</span>
            <input name={key} defaultValue={values[key]} onBlur={onBlur} autoComplete='off' />
            {envConfig.includes(key as StimulateType) && (
              <>
                <input
                  name={`${key}EnvStep`}
                  defaultValue={values[`${key}EnvStep` as keyof Config]}
                  onBlur={onBlur}
                />
                <input
                  name={`${key}EnvFinal`}
                  defaultValue={values[`${key}EnvFinal` as keyof Config]}
                  onBlur={onBlur}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Environment
