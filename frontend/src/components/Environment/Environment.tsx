import { FC, FocusEvent, InputHTMLAttributes, useEffect, useState } from 'react'
import { getConfig, setConfig, Config, subscribe, StimulateType, envConfig } from 'classes'
import s from './Environment.module.css'
import { track } from 'utils/amplitude'

const initConfig = getConfig()

export type EnvFields = Array<
  | [string, Array<keyof Config | ({ key: keyof Config } & InputHTMLAttributes<HTMLInputElement>)>]
  | ['_header', Array<string>]
>

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
    track('INPUT', { key: e.target.name, value: +e.target.value })
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
                    {header as string}
                  </span>
                ))}
              </>
            ) : (
              <>
                {keys.map(keyOrProps => {
                  const key = typeof keyOrProps === 'string' ? keyOrProps : keyOrProps.key
                  const props = typeof keyOrProps === 'string' ? {} : keyOrProps
                  return (
                    <input
                      type='number'
                      key={key}
                      name={key}
                      defaultValue={values[key as keyof Config]}
                      onBlur={onBlur}
                      onInput={'type' in props && props.type === 'range' ? onBlur : undefined}
                      autoComplete='off'
                      {...props}
                    />
                  )
                })}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Environment
