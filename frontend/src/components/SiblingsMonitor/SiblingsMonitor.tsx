import { Fragment, FC } from 'react'
import cx from 'classnames'
import { EngineClass, getConfig } from 'classes'
import s from './SiblingsMonitor.module.css'

const SiblingsMonitor: FC<{ engine: EngineClass }> = ({ engine }) => {
  const {
    statistic: { survivedCount, population, generationsStat, getLastGenerationNumber },
    watchGeneration,
    setWatchGeneration,
  } = engine
  const { population: maxPopulation } = getConfig()

  const getClickHandler = (number: number | false) => () => {
    setWatchGeneration(number)
  }

  const currentWatchGeneration =
    watchGeneration ??
    getLastGenerationNumber(
      generation => generation.count && generation.survived < generation.count,
    )

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
                className={s.monitorSurvivedCountLine}
                style={{ width: `calc(100% * ${values.survived / values.count})` }}
              ></div>
              <p className={s.monitorItemTitle}>
                <span>generation #{generationNumber}</span>
                <span>
                  <span className={s.survivedNumber}>{values.survived}</span> /{' '}
                  <span className={s.itemCount}>{values.count}</span>
                </span>
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
          style={{ width: `calc(100% * ${survivedCount / population})` }}
        ></div>
        <p className={s.monitorItemTitle}>
          <span>total</span>
          <span>
            <span className={s.survivedNumber}>{survivedCount}</span> /{' '}
            <span className={s.itemCount}>{population}</span>
          </span>
        </p>
      </div>

      <div className={cx(s.item, s.load)} onClick={getClickHandler(false)}>
        <div
          className={s.monitorItemCountLine}
          style={{ width: `calc(100% * ${population / maxPopulation})` }}
        ></div>
        <p className={s.monitorItemTitle}>
          <span>load</span>
        </p>
      </div>
    </div>
  )
}

export default SiblingsMonitor
