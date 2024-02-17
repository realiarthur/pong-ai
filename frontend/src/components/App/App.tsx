import { useLayoutEffect, useState, ChangeEventHandler, useEffect } from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, getConfig, controllers, Side, Controller } from 'classes'
import Intelligence from 'components/Intelligence/Intelligence'
import Environment, { EnvFields } from 'components/Environment/Environment'
import cx from 'classnames'
import SiblingsMonitor from 'components/SiblingsMonitor/SiblingsMonitor'
import Button, { Tab } from 'components/Button/Button'

const { VISIBLE_SETS_COUNT } = getConfig()

type Theme = 'dark' | 'light'
const initTheme: Theme = 'dark'
document.body.className = initTheme

const engine = new EngineClass()
const { loadLeader, saveLeader, killSet, update, setControllers, watchLeaderToggle, savedPlayers } =
  engine

setControllers('env', 'ai')

// const headers = ['pY', '|ΔX|', 'bY', 'NbVx', 'bVy']
// const headers = ['pY', "ΔX'", 'ΔX', "bY'", 'bY']
// const headers = ['p|X|', 'pY', 'b|X|', 'bY', "b|X|'", "bY'"]
// const headers = ['ΔX', 'pY', 'bY', 'ᾱ', 'e']
// const headers = ['ΔX', 'pY', 'bY', "bVx'", 'bVy', 'e']
// const headers = ['ΔX', 'pY', 'bY', "bVx'", 'bVy']
const headers = ['ΔX', 'pY', 'bY', "cos'", 'sin']

type EngineUpdates = ReturnType<EngineClass['update']>
const updatesInit = engine.update()
let wakeLock: WakeLockSentinel | null = null
const releaseWakeLock = () => {
  wakeLock?.release().then(() => {
    wakeLock = null
  })
}

const App = () => {
  const [on, setOn] = useState(true)
  const togglePlay = () => setOn(value => !value)
  const [sets, setSets] = useState<EngineUpdates>(updatesInit)
  const forceUpdate = () => {
    setSets(sets => [...sets])
  }
  const [theme, setTheme] = useState<Theme>(initTheme)
  const themeToggle = () => {
    const neeValue = theme === 'dark' ? 'light' : 'dark'
    setTheme(neeValue)
    document.body.className = neeValue
  }

  useLayoutEffect(() => {
    if (!on) {
      releaseWakeLock()
      return
    }

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLock = lock
      })
    }

    let shouldUpdate = true
    const cancel = () => {
      shouldUpdate = false
    }

    const tick = () => {
      if (!shouldUpdate) return

      setSets(update())
      requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancel()
      releaseWakeLock()
    }
  }, [on])

  const { leader, hasOnlyAi, hasEnvAi, hasAi, watchIndividual, hasKeys } = engine

  const envFields: EnvFields | null =
    // hasOnlyAi
    //   ? [
    //       ['_header', ['current', 'step', 'final']],
    //       ['speed', ['ballSpeed', 'ballSpeedEnvStep', 'ballSpeedEnvFinal']],
    //       ['mutation', ['maxMutation', 'maxMutationEnvStep', 'maxMutationEnvFinal']],
    //       ['_header', ['max', 'score']],
    //       ['population', ['population', 'divisionScore']],
    //     ]
    // :
    hasEnvAi
      ? [
          ['_header', ['current', 'step', 'final']],
          ['bounce', ['bounce', 'bounceEnvStep', 'bounceEnvFinal']],
          ['fail', ['fail', 'failEnvStep', 'failEnvFinal']],
          ['move', ['move', 'moveEnvStep', 'moveEnvFinal']],
          ['middle', ['middle', 'middleEnvStep', 'middleEnvFinal']],
          ['speed', ['ballSpeed', 'ballSpeedEnvStep', 'ballSpeedEnvFinal']],
          ['mutation', ['maxMutation', 'maxMutationEnvStep', 'maxMutationEnvFinal']],
          ['wall min°', ['wallMinAngle', 'wallMinAngleEnvStep', 'wallMinAngleEnvFinal']],
          ['_header', ['max', 'birth', 'death']],
          ['population', ['population', 'divisionThreshold', 'deathThreshold']],
        ]
      : [['speed', ['ballSpeed']]]

  let visibleSets: EngineUpdates = []
  for (let index = 0; index < sets.length; index++) {
    const set = sets[index]
    if (!set.survived) {
      visibleSets.push(set)
    }

    if (visibleSets.length >= VISIBLE_SETS_COUNT) {
      if (leader && !visibleSets.includes(leader?.set)) {
        visibleSets.push(leader.set)
      }
      break
    }
  }

  // callbacks
  const handleChangeController: (side: Side) => (key: string) => void =
    side => (key: Controller | string) => {
      const controller = !!savedPlayers[key] ? savedPlayers[key] : (key as Controller)

      const leftController = side === 'left' ? controller : engine.leftController
      const rightController = side === 'right' ? controller : engine.rightController
      setControllers(leftController, rightController)
      forceUpdate()
    }
  const random = () => {
    engine.random()
    forceUpdate()
  }
  const newGeneration = () => {
    engine.generateGeneration()
    forceUpdate()
  }
  const mutate = () => {
    engine.mutateLeader()
    forceUpdate()
  }
  const restart = () => {
    engine.restart()
    forceUpdate()
  }
  const compare = () => {
    const keys = Object.keys(savedPlayers)
    handleChangeController('left')(keys[keys.length - 1])
    handleChangeController('right')(keys[keys.length - 2] ?? keys[keys.length - 1])
  }
  const play = () => {
    const keys = Object.keys(savedPlayers)
    handleChangeController('left')('keys')
    handleChangeController('right')(keys[keys.length - 1])
  }

  return (
    <div className={cx(s.app)}>
      <Button className={s.theme} onClick={themeToggle}>
        {theme}
      </Button>
      <div className={s.modeControls}>
        <Tab active={hasEnvAi} onClick={() => handleChangeController('left')('env')}>
          train
        </Tab>
        <Tab active={hasOnlyAi} onClick={compare} disabled={!Object.keys(savedPlayers)}>
          compare
        </Tab>
        <Tab active={hasKeys} onClick={play} disabled={!Object.keys(savedPlayers)}>
          play
        </Tab>
      </div>
      <div className={s.container}>
        <div className={s.main}>
          <div className={s.boardContainer}>
            <div className={s.header}>
              <span className={cx(s.score, s.left)}>{leader?.set.players[0].score ?? 0}</span>
              <select
                className={s.controller}
                value={
                  typeof engine.leftController === 'string'
                    ? engine.leftController
                    : engine.leftController.getKey()
                }
                onChange={e => handleChangeController('left')(e.target.value)}
              >
                {controllers.map((controller, index) => (
                  <option key={index} value={controller}>
                    {controller}
                  </option>
                ))}
                {Object.keys(savedPlayers).map(key => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>

              <div className={s.controls}>
                <Button onClick={togglePlay} keyCode='Space'>
                  <u> </u>
                  {on ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={restart} keyCode='KeyR'>
                  <u>R</u>estart
                </Button>
              </div>

              <select
                className={cx(s.controller, s.right)}
                value={
                  typeof engine.rightController === 'string'
                    ? engine.rightController
                    : engine.rightController.getKey()
                }
                onChange={e => handleChangeController('right')(e.target.value)}
              >
                <option value={'ai'}>ai</option>
                {Object.keys(savedPlayers).map(key => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>

              <span className={cx(s.score, s.right)}>{leader?.set.players[1].score ?? 0}</span>
            </div>
            <Board sets={visibleSets} leader={leader?.player} leaderSet={leader?.set} />
          </div>

          <div className={cx(s.col)}>
            <div className={cx(s.row, s.gap50)}>
              {hasAi && !hasKeys && (
                <div className={s.intelligence}>
                  {leader?.set.players[0].brain && (
                    <>
                      <p className={s.title}>Gen.sib {leader?.set.players[0].brain?.getKey()}</p>
                      <div className={s.subtitle}>
                        {hasAi && !hasOnlyAi && (
                          <p className={s.motivationScore}>
                            stimulation: {Math.round(leader?.set.players[0].stimulation)}
                          </p>
                        )}
                      </div>
                      <Intelligence intelligence={leader?.set.players[0].brain} headers={headers} />
                    </>
                  )}
                  {leader?.set.players[1].brain && (
                    <>
                      <p className={s.title}>Gen.sib {leader?.set.players[1].brain?.getKey()}</p>
                      <div className={s.subtitle}>
                        {hasAi && !hasOnlyAi && (
                          <p className={s.motivationScore}>
                            stimulation: {Math.round(leader?.set.players[1].stimulation)}
                          </p>
                        )}
                      </div>

                      <Intelligence intelligence={leader?.set.players[1].brain} headers={headers} />
                    </>
                  )}
                  {hasEnvAi && (
                    <>
                      <div className={s.controls}>
                        <Button
                          onClick={watchLeaderToggle}
                          className={cx({ [s.unwatch]: watchIndividual })}
                        >
                          Watch
                        </Button>
                        <Button onClick={() => killSet(leader?.set)}>Kill</Button>
                        <Button onClick={mutate} keyCode='KeyM'>
                          <u>M</u>utate
                        </Button>
                      </div>
                      <div className={s.controls}>
                        <Button onClick={loadLeader}>Load</Button>
                        <Button onClick={saveLeader} keyCode='KeyE'>
                          Sav<u>e</u>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {envFields && (
                <div className={s.environment}>
                  <p className={s.title}>Environment</p>

                  <Environment fields={envFields} />

                  {hasEnvAi && (
                    <>
                      <p className={s.title}>Sibling number</p>

                      <SiblingsMonitor engine={engine} />
                      <div className={s.controls}>
                        <Button onClick={random} keyCode='KeyA'>
                          R<u>a</u>ndom
                        </Button>
                        <Button
                          onClick={newGeneration}
                          disabled={engine.statistic.survivedCount < 2}
                          keyCode='KeyT'
                        >
                          Genera<u>t</u>e
                        </Button>
                      </div>
                    </>
                  )}
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
