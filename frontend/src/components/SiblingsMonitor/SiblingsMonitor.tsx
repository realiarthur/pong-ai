import { Fragment, FC } from 'react'
import cx from 'classnames'
import { EngineClass, getConfig } from 'classes'
import s from './SiblingsMonitor.module.css'

const SiblingsMonitor: FC<{ engine: EngineClass }> = ({ engine }) => {
  const {
    population,
    generationsStat,
    watchGeneration,
    getLastGenerationWithCount,
    setWatchGeneration,
  } = engine
  const { population: maxPopulation } = getConfig()

  const getClickHandler = (number: number | false) => () => {
    setWatchGeneration(number)
  }

  const currentWatchGeneration = watchGeneration ?? getLastGenerationWithCount()

  return (
    <div className={s.siblingsMonitor}>
      {generationsStat.map((values, generationNumber) => (
        <Fragment key={generationNumber}>
          {values && !!values.count && (
            <div
              className={cx(s.item, { [s.watched]: generationNumber === currentWatchGeneration })}
              onClick={getClickHandler(generationNumber)}
            >
              <div
                className={s.monitorItemCountLine}
                style={{ width: `calc(100% * ${values.count / population})` }}
              ></div>
              <p className={s.monitorItemTitle}>
                <span>generation #{generationNumber}</span>
                <span>{values.count}</span>
              </p>
            </div>
          )}
        </Fragment>
      ))}

      <div
        className={cx(s.item, s.total, { [s.watched]: currentWatchGeneration === false })}
        onClick={getClickHandler(false)}
      >
        <div
          className={s.monitorItemCountLine}
          style={{ width: `calc(100% * ${population / maxPopulation})` }}
        ></div>
        <p className={s.monitorItemTitle}>
          <span>total</span>
          <span>{population}</span>
        </p>
      </div>
    </div>
  )
}

export default SiblingsMonitor
