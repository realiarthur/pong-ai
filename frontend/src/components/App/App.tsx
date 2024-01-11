import {
  ChangeEvent,
  Fragment,
  useLayoutEffect,
  useReducer,
  useState,
  ChangeEventHandler,
} from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, getConfig, controllers, Side, Controller } from 'classes'
import Intelligence from 'components/Intelligence/Intelligence'
import { getNumberString } from 'utils/getNumberString'
import Environment, { EnvFields } from 'components/Config/Config'
import cx from 'classnames'
import SiblingsMonitor from 'components/SiblingsMonitor/SiblingsMonitor'

type Theme = 'dark' | 'light'
const initTheme: Theme = 'dark'
document.body.className = initTheme

const engine = new EngineClass()
const {
  loadLeader,
  saveLeader,
  createSets,
  restart,
  clearSets,
  killSet,
  update,
  setControllers,
  watchLeaderToggle,
} = engine

setControllers('env', 'ai')

const handleChangeController: (side: Side) => ChangeEventHandler<HTMLSelectElement> = side => e => {
  const value = e.target.value as Controller
  const leftController = side === 'left' ? value : engine.leftController
  const rightController = side === 'right' ? value : engine.rightController
  setControllers(leftController, rightController)
}

// const headers = ['pY', '|ΔX|', 'bY', 'NbVx', 'bVy']
// const headers = ['pY', "ΔX'", 'ΔX', "bY'", 'bY']
const headers = ['pY', 'p|X|', "b|X|'", 'b|X|', "bY'", 'bY']

type EngineUpdates = ReturnType<EngineClass['update']>
const updatesInit = engine.update()

const App = () => {
  const [on, setOn] = useState(true)
  const [sets, forceUpdate] = useState<EngineUpdates>(updatesInit)
  const [theme, setTheme] = useState<Theme>(initTheme)
  const themeToggle = () => {
    const neeValue = theme === 'dark' ? 'light' : 'dark'
    setTheme(neeValue)
    document.body.className = neeValue
  }

  useLayoutEffect(() => {
    if (!on) return

    let shouldUpdate = true
    const cancel = () => {
      shouldUpdate = false
    }

    const tick = () => {
      if (!shouldUpdate) return

      forceUpdate(update())
      requestAnimationFrame(tick)
    }
    tick()

    return cancel
  }, [on])

  const { population: maxPopulation } = getConfig()
  const { leader, hasOnlyAi, hasEnvAi, hasAi, watchIndividual } = engine

  const random = () => {
    clearSets()
    createSets(undefined, maxPopulation * 3)
  }

  if (leader && !sets.includes(leader?.set)) {
    sets.push(leader.set)
  }

  const envFields: EnvFields | null = hasOnlyAi
    ? [
        ['max mutation', 'maxMutation'],
        ['speed', 'ballSpeed'],
        ['division score', 'divisionScore'],
        ['population', 'population'],
      ]
    : hasEnvAi
    ? [
        ['bounce', 'bounce'],
        ['fail', 'fail'],
        ['move', 'move'],
        ['speed', 'ballSpeed'],
        ['mutation', 'maxMutation'],
        ['wall min°', 'wallMinAngle'],
        ['population', 'population'],
        ['division / death', 'divisionThreshold'],
      ]
    : [['speed', 'ballSpeed']]

  return (
    <div className={cx(s.app)}>
      <button className={s.theme} onClick={themeToggle}>
        {theme}
      </button>
      <div className={s.container}>
        <div className={s.main}>
          <div className={s.boardContainer}>
            <div className={s.header}>
              <span className={cx(s.score, s.left)}>{leader?.set.players[0].score ?? 0}</span>
              <select
                className={s.controller}
                value={engine.leftController}
                onChange={handleChangeController('left')}
              >
                {controllers.map((controller, index) => (
                  <option key={index} value={controller}>
                    {controller}
                  </option>
                ))}
              </select>

              <div className={s.controls}>
                <button onClick={() => setOn(value => !value)}>{on ? 'Pause' : 'Play'}</button>
                <button onClick={restart}>Restart</button>
              </div>

              <select
                className={cx(s.controller, s.right)}
                value={engine.rightController}
                onChange={handleChangeController('right')}
                disabled
              >
                {controllers.map((controller, index) => (
                  <option key={index} value={controller}>
                    {controller}
                  </option>
                ))}
              </select>

              <span className={cx(s.score, s.right)}>{leader?.set.players[1].score ?? 0}</span>
            </div>
            <Board sets={sets} leader={leader?.player} leaderSet={leader?.set} />
          </div>

          <div className={cx(s.col)}>
            <div className={cx(s.row, s.gap50)}>
              {hasAi && (
                <div className={s.intelligence}>
                  {leader?.set.players[1].brain && (
                    <>
                      <p className={s.title}>
                        Gen.sib #{leader?.player.brain?.generation}.
                        {leader?.player.brain?.siblingIndex}
                      </p>

                      <div className={s.subtitle}>
                        {hasAi && !hasOnlyAi && (
                          <p className={s.motivationScore}>
                            stimulation: {Math.round(leader?.player.stimulation)}
                          </p>
                        )}
                        <p>threshold: {getNumberString(leader?.player.brain?.threshold)}</p>
                      </div>

                      <Intelligence intelligence={leader?.set.players[1].brain} headers={headers} />
                    </>
                  )}

                  <div className={s.controls}>
                    <button onClick={loadLeader}>Load</button>
                    <button onClick={saveLeader}>Save</button>
                    <button
                      onClick={watchLeaderToggle}
                      className={cx({ [s.unwatch]: watchIndividual })}
                    >
                      Watch
                    </button>
                    <button onClick={() => killSet(leader?.player.brain?.generation, leader?.set)}>
                      Kill
                    </button>
                  </div>
                </div>
              )}

              {envFields && (
                <div className={s.environment}>
                  <p className={s.title}>Environment</p>

                  <Environment fields={envFields} />

                  <p className={s.title}>Siblings number</p>

                  <SiblingsMonitor engine={engine} />
                  <div className={s.controls}>
                    <button onClick={random}>Random</button>
                    <button onClick={() => createSets(leader?.player.brain)}>Mutate</button>
                  </div>
                </div>
              )}
            </div>
            <div className={s.controlLine}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
