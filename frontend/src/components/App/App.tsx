import { useLayoutEffect, useState, ChangeEventHandler, useEffect } from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, getConfig, controllers, Side, Controller, setConfig } from 'classes'
import Intelligence from 'components/Intelligence/Intelligence'
import Environment, { EnvFields } from 'components/Environment/Environment'
import cx from 'classnames'
import SiblingsMonitor from 'components/SiblingsMonitor/SiblingsMonitor'
import Button, { Tab } from 'components/Button/Button'
import CrossingIllustration from 'components/CrossingIllustration/CrossingIllustration'
import GlobalMinimumIllustration from 'components/GlobalMinimumIllustration/GlobalMinimumIllustration'

const { VISIBLE_SETS_COUNT, aiSpeed } = getConfig()

type Theme = 'dark' | 'light'
const initTheme: Theme = 'dark'
document.body.className = initTheme

const engine = new EngineClass()
const { saveLeader, killSet, update, setControllers, watchLeaderToggle } = engine

// const headers = ['pY', '|ΔX|', 'bY', 'NbVx', 'bVy']
// const headers = ['pY', "ΔX'", 'ΔX', "bY'", 'bY']
// const headers = ['p|X|', 'pY', 'b|X|', 'bY', "b|X|'", "bY'"]
// const headers = ['ΔX', 'pY', 'bY', 'ᾱ', 'e']
// const headers = ['ΔX', 'pY', 'bY', "bVx'", 'bVy', 'e']
// const headers = ['ΔX', 'pY', 'bY', "bVx'", 'bVy']
const headers = ['pY', "bX'", 'bY', "cos'", 'sin']

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

  const { savedPlayers } = engine

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

  const envFields: EnvFields | null = hasEnvAi
    ? [
        ['_header', ['current', 'step', 'final']],
        ['bounce', ['bounce', 'bounceEnvStep', 'bounceEnvFinal']],
        ['fail', ['fail', 'failEnvStep', 'failEnvFinal']],
        ['speed', ['ballSpeed', 'ballSpeedEnvStep', 'ballSpeedEnvFinal']],
        ['mutation', ['maxMutation', 'maxMutationEnvStep', 'maxMutationEnvFinal']],
        ['wall min°', ['wallMinAngle', 'wallMinAngleEnvStep', 'wallMinAngleEnvFinal']],
        ['_header', ['max', 'birth', 'death']],
        ['population', ['population', 'divisionThreshold', 'deathThreshold']],
      ]
    : hasOnlyAi
    ? [['ball speed', [{ key: 'ballSpeed', type: 'range', min: 13, max: 22 }]]]
    : [
        ['ball speed', [{ key: 'ballSpeed', type: 'range', min: 13, max: 22 }]],
        ['player speed', [{ key: 'playerSpeed', type: 'range', min: 7, max: 20 }]],
        ['ai speed', [{ key: 'aiSpeed', disabled: true, type: 'range', min: 7, max: 20 }]],
      ]

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
    handleChangeController('left')(keys[0])
    handleChangeController('right')(keys[1] ?? keys[0])
    setConfig({ ballSpeed: 20 })
    setSets(engine.sets)
  }
  const play = () => {
    const keys = Object.keys(savedPlayers)
    handleChangeController('left')('keys')
    handleChangeController('right')(keys[0])
    setConfig({ ballSpeed: 15 })
    setSets(engine.sets)
  }
  const train = () => {
    handleChangeController('left')('env')
    handleChangeController('right')('ai')
    random()
    setConfig({ ballSpeed: 13 })
    setSets(engine.sets)
  }

  useEffect(() => {
    play()
  }, [])

  const tab = hasKeys ? 'play' : hasOnlyAi ? 'compare' : 'train'

  return (
    <div className={cx(s.app)}>
      <Button className={s.theme} onClick={themeToggle} trackId='theme'>
        {theme}
      </Button>
      <div className={s.modeControls}>
        <Tab
          active={tab === 'play'}
          onClick={play}
          disabled={!Object.keys(savedPlayers)}
          trackId='play'
        >
          play
        </Tab>
        <Tab
          active={tab === 'compare'}
          onClick={compare}
          disabled={!Object.keys(savedPlayers)}
          trackId='compare'
        >
          compare
        </Tab>
        <Tab active={tab === 'train'} onClick={train} trackId='train'>
          train
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
                <Button onClick={togglePlay} keyCode='Space' preventDefault trackId='pause'>
                  <u> </u>
                  {on ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={restart} keyCode='KeyR' trackId='restart'>
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
            {/* {!on && (
              <Button onClick={togglePlay} trackId='start' className={s.startBtn}>
                start
              </Button>
            )} */}
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
                          keyCode='KeyT'
                          disabled={!leader}
                          trackId='watch'
                        >
                          Wa<u>t</u>ch
                        </Button>
                        <Button
                          onClick={saveLeader}
                          keyCode='KeyE'
                          disabled={!leader}
                          trackId='save'
                        >
                          Sav<u>e</u>
                        </Button>
                        <Button onClick={mutate} keyCode='KeyM' disabled={!leader} trackId='mutate'>
                          <u>M</u>utate
                        </Button>
                        <Button
                          onClick={() => killSet(leader?.set)}
                          disabled={!leader}
                          trackId='kill'
                        >
                          Kill
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
                        <Button onClick={random} keyCode='KeyN' trackId='random'>
                          Ra<u>n</u>dom
                        </Button>
                        <Button
                          onClick={newGeneration}
                          disabled={engine.statistic.survivedCount < 2}
                          keyCode='KeyC'
                          trackId='reproduce'
                        >
                          Reprodu<u>c</u>e
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
      {/* <CrossingIllustration />
      <GlobalMinimumIllustration /> */}
    </div>
  )
}

export default App
