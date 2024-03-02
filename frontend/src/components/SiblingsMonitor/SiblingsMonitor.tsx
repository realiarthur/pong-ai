import { Fragment, FC } from 'react'
import cx from 'classnames'
import { EngineClass, getConfig } from 'classes'
import s from './SiblingsMonitor.module.css'

const SiblingsMonitor: FC<{ engine: EngineClass }> = ({ engine }) => {
  const {
    statistic: { population, generationsStat },
    iterationTicks,
  } = engine

  const { population: maxPopulation, surviversCount } = getConfig()
  const maxIterationCount = maxPopulation - surviversCount
  const iterationPercent =
    population > maxIterationCount
      ? 0
      : Math.floor(100 - ((population - surviversCount) / maxIterationCount) * 100)

  return (
    <div className={s.siblingsMonitor}>
      {generationsStat.map((values, generationNumber) => (
        <Fragment key={generationNumber}>
          {values && !!values.count && (
            <div
              className={cx(s.item, {
                [s.watched]: generationNumber === engine.leader?.player.brain?.generation,
              })}
            >
              <div
                className={s.monitorItemCountLine}
                style={{ width: `calc(100% * ${values.count / population})` }}
              ></div>
              <p className={s.monitorItemTitle}>
                <span>generation #{generationNumber}</span>
                <span>
                  <span className={s.itemCount}>{values.count}</span>
                </span>
              </p>
            </div>
          )}
        </Fragment>
      ))}

      <div className={cx(s.item, s.total)}>
        <div
          className={s.monitorItemCountLine}
          style={{ width: `calc(100% * ${population / maxPopulation})` }}
        ></div>
        <p className={s.monitorItemTitle}>
          <span>total</span>
          <span className={s.itemCount}>{population}</span>
        </p>
      </div>

      <div className={cx(s.item, s.load)}>
        <div
          className={s.monitorItemCountLine}
          style={{
            width: `${iterationPercent}%`,
          }}
        ></div>
        <p className={s.monitorItemTitle}>
          <span>selected {iterationPercent}%</span>
          <span className={s.itemCount}>{iterationTicks} frms</span>
        </p>
      </div>
    </div>
  )
}

export default SiblingsMonitor
