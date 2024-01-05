import { Fragment, useLayoutEffect, useReducer, useRef, useState } from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, getConfig } from 'classes'
import Intelligence from 'components/Intelligence/Intelligence'
import { getNumberString } from 'utils/getNumberString'
import Config from 'components/Config/Config'
import cx from 'classnames'

const { VISIBLE_SETS_COUNT } = getConfig()

const engine = new EngineClass()
engine.setControllers('wall', 'ai')

const { loadLeader, saveLeader, createSets, restart } = engine

// const headers = ['pY', '|ΔX|', 'bY', 'NbVx', 'bVy']
const headers = ['pY', "ΔX'", 'ΔX', "bY'", 'bY']

const App = () => {
  const [on, setOn] = useState(true)
  const [_, forceUpdate] = useReducer(x => x + 1, 0)

  useLayoutEffect(() => {
    if (!on) return

    let shouldUpdate = true
    const cancel = () => {
      shouldUpdate = false
    }

    const update = () => {
      if (!shouldUpdate) return

      engine.update()
      forceUpdate()
      requestAnimationFrame(update)
    }
    update()

    return cancel
  }, [on])

  const visibleSets = engine.sets.slice(0, VISIBLE_SETS_COUNT)
  if (engine.leader && engine.leader.index >= VISIBLE_SETS_COUNT) {
    visibleSets.push(engine.leader.set)
  }

  return (
    <div className={s.app}>
      <div className={s.container}>
        <div className={s.main}>
          {/* <div className={s.intelligence}>
          {engine.leaderSet?.players[0].brain && (
            <>
              <p className={s.motivationScore}>best motivation: {engine.leader?.stimulation}</p>

              <Intelligence intelligence={engine.leaderSet?.players[0].brain} headers={headers} />

              <div className={s.controls}>
                <button onClick={() => createSets()}>Randomize</button>
                <button onClick={() => mutateLeader()}>Mutate</button>
                <button onClick={() => saveLeader()}>Save</button>
                <button onClick={() => loadLeader()}>Load</button>
              </div>
            </>
          )}
        </div> */}

          <div className={s.boardContainer}>
            <div className={s.header}>
              <span className={s.score}>{engine.leader?.set.players[0].score}</span>

              <span className={s.score}>{engine.leader?.set.players[1].score}</span>
            </div>
            <Board
              sets={visibleSets}
              leader={engine.leader?.player}
              leaderSet={engine.leader?.set}
            />
          </div>

          <div className={cx(s.col)}>
            <div className={cx(s.row, s.gap50)}>
              <div className={s.intelligence}>
                {engine.leader?.set.players[1].brain && (
                  <>
                    <p className={s.title}>
                      Gen.sib #{engine.leader?.player.brain?.generation}.
                      {engine.leader?.player.brain?.siblingIndex}
                    </p>

                    <div className={s.subtitle}>
                      <p className={s.motivationScore}>
                        best motivation: {engine.leader?.player.stimulation}
                      </p>
                      <p>
                        output threshold: {getNumberString(engine.leader?.player.brain?.threshold)}
                      </p>
                    </div>

                    <Intelligence
                      intelligence={engine.leader?.set.players[1].brain}
                      headers={headers}
                    />
                  </>
                )}
              </div>

              <div>
                <p className={s.title}>Environment</p>

                <Config
                  fields={[
                    ['bounce stimulation', 'bounceStimulation'],
                    ['fail coast', 'failStimulation'],
                    ['extra-move cost', 'moveStimulation'],
                    ['cost increase step', 'moveCoastIncreaseStep'],
                    ['population increase', 'population'],
                    ['max mutation', 'maxMutation'],
                    ['division threshold', 'divisionThreshold'],
                    ['wall min angle', 'wallMinAngle'],
                  ]}
                />

                <p className={s.title}>Siblings number</p>

                <div className={s.generationMonitor}>
                  {engine.generationsStat.map((values, generation) => (
                    <Fragment key={generation}>
                      {values && !!values.count && (
                        <div className={s.item}>
                          <div
                            className={s.monitorItemCountLine}
                            style={{ width: `calc(100% * ${values.count / engine.sets.length})` }}
                          ></div>
                          <p className={s.monitorItemTitle}>
                            <span>generation #{generation}</span>
                            <span>{values.count}</span>
                          </p>
                        </div>
                      )}
                    </Fragment>
                  ))}
                  <div className={s.item}>
                    <p>
                      <span>total</span>
                      <span> {engine.sets.length}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.controlLine}>
              <div className={s.controls}>
                <button onClick={() => setOn(value => !value)}>{on ? 'Pause' : 'Play'}</button>
                <button onClick={() => restart()}>Restart</button>
              </div>

              <div className={s.controls}>
                <button
                  onClick={() => {
                    engine.clearSets()
                    createSets()
                  }}
                >
                  Random
                </button>
                <button onClick={() => createSets(engine.leader?.player.brain)}>Mutate</button>
              </div>

              <div className={s.controls}>
                <button onClick={() => saveLeader()}>Save</button>
                <button onClick={() => loadLeader()}>Load</button>
                <button onClick={() => engine.killSet(engine.leader?.index)}>Kill</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
