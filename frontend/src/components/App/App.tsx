import { useLayoutEffect, useState, useEffect, useCallback, Fragment } from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, getConfig, setConfig, controllers, Side, Controller } from 'classes'
import Intelligence from 'components/Intelligence/Intelligence'
import Environment, { EnvFields } from 'components/Environment/Environment'
import cx from 'classnames'
import SiblingsMonitor from 'components/SiblingsMonitor/SiblingsMonitor'
import Button, { Tab } from 'components/Button/Button'
import CrossingIllustration from 'components/CrossingIllustration/CrossingIllustration'
import GlobalMinimumIllustration from 'components/GlobalMinimumIllustration/GlobalMinimumIllustration'
import { useSetCssConst } from 'utils/setCssConst'

const { VISIBLE_SETS_COUNT, ...initialConfig } = getConfig()

type Theme = 'dark' | 'light'
const initTheme: Theme = 'dark'
document.body.className = initTheme

const engine = new EngineClass()
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
  useSetCssConst()
  const [on, setOn] = useState(true)
  const togglePlay = useCallback(() => setOn(value => !value), [])
  const [sets, setSets] = useState<EngineUpdates>(updatesInit)
  const forceUpdate = () => {
    setSets(sets => [...sets])
  }
  // const [theme, setTheme] = useState<Theme>(initTheme)
  // const themeToggle = () => {
  //   const neeValue = theme === 'dark' ? 'light' : 'dark'
  //   setTheme(neeValue)
  //   document.body.className = neeValue
  // }

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

      setSets(engine.update())
      requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancel()
      releaseWakeLock()
    }
  }, [on])

  const {
    leader,
    hasOnlyAi,
    hasEnvAi,
    hasAi,
    hasHuman,
    hasPointer,
    savedPlayers,
    status,
    statistic,
  } = engine
  const { population, ballSpeed } = getConfig()

  const envFields: EnvFields | null = hasEnvAi
    ? [
        ['ball speed', ['ballSpeed']],
        ['wall min bounce angle', ['wallMinAngle']],
        ['max population', ['population']],
        ['max mutation', ['maxMutation']],
        ['number of survivors', ['surviversCount']],
        [
          'death threshold',
          [
            {
              key: 'deathScore',
              disabled: status !== 'gene poll generation' || statistic.population < population,
            },
          ],
        ],
        // ['crossover', ['crossover']],
      ]
    : hasOnlyAi
    ? [['ball speed', [{ key: 'ballSpeed', type: 'range', min: 15, max: 25 }]]]
    : hasPointer
    ? [
        ['ball speed', [{ key: 'ballSpeed', type: 'range', min: 15, max: 25 }]],
        ['ai speed', [{ key: 'aiSpeed', disabled: true, type: 'range', min: 7, max: 20 }]],
      ]
    : [
        ['ball speed', [{ key: 'ballSpeed', type: 'range', min: 15, max: 25 }]],
        ['player speed', [{ key: 'playerSpeed', type: 'range', min: 7, max: 20 }]],
        ['ai speed', [{ key: 'aiSpeed', disabled: true, type: 'range', min: 7, max: 20 }]],
      ]

  let visibleSets: EngineUpdates = sets.slice(0, VISIBLE_SETS_COUNT)
  if (leader && !visibleSets.includes(leader?.set)) {
    visibleSets.push(leader.set)
  }

  // callbacks
  const handleChangeController: (side: Side) => (key: string) => void =
    side => (key: Controller | string) => {
      const controller = !!savedPlayers[key] ? savedPlayers[key] : (key as Controller)

      const leftController = side === 'left' ? controller : engine.leftController
      const rightController = side === 'right' ? controller : engine.rightController
      engine.setControllers(leftController, rightController)
      forceUpdate()
    }

  const random = useCallback(() => {
    engine.random(population * 3)
    forceUpdate()
  }, [])
  const mutate = useCallback(() => {
    engine.mutateLeader()
    forceUpdate()
  }, [])
  const save = useCallback(() => {
    engine.saveLeader()
    forceUpdate()
  }, [])
  const kill = useCallback(() => {
    engine.leader = undefined
    engine.killSet(leader?.set)
    forceUpdate()
  }, [])
  const restart = useCallback(() => {
    engine.restart()
    if (hasEnvAi) {
      engine.reset()
      random()
    } else {
      forceUpdate()
    }
  }, [hasEnvAi, population])

  const compare = () => {
    const keys = Object.keys(savedPlayers)
    handleChangeController('left')(keys[1] ?? keys[0])
    handleChangeController('right')(keys[0])
    setConfig({ ballSpeed: 20 })
    setSets(engine.sets)
    setOn(true)
  }
  const play = () => {
    const keys = Object.keys(savedPlayers)
    const controller: Controller = 'ontouchstart' in document.documentElement ? 'pointer' : 'keys'
    handleChangeController('left')(controller)
    handleChangeController('right')(keys[0])
    setConfig({ ballSpeed: 20 })
    setSets(engine.sets)
    setOn(true)
  }
  const train = () => {
    handleChangeController('left')('env')
    handleChangeController('right')('ai')
    random()
    setConfig(initialConfig)
    setSets(engine.sets)
    setOn(true)
  }

  useEffect(() => {
    play()
  }, [])

  useLayoutEffect(() => {
    if (ballSpeed === 0) {
      setOn(false)
    }
  }, [ballSpeed])

  useEffect(() => {
    if (!hasEnvAi || sets.length > 0) return

    if (window.confirm(`Save gen.sib ${leader?.player.brain?.getKey() || ''}?`)) {
      save()
      compare()
    }
  }, [hasEnvAi, sets.length])

  const tab = hasHuman ? 'play' : hasOnlyAi ? 'compare' : 'train'

  return (
    <div className={cx(s.app)}>
      {/* <Button className={s.theme} onClick={themeToggle} trackId='theme'>
        {theme}
      </Button> */}
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
                  <Fragment key={index}>
                    {controller !== 'ai' && <option value={controller}>{controller}</option>}
                  </Fragment>
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
                {hasEnvAi && <option value={'ai'}>ai</option>}
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

            <div className={cx(s.controls, s.mobile)}>
              <Button onClick={togglePlay} trackId='pause'>
                {on ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={restart} trackId='restart'>
                Restart
              </Button>
            </div>
          </div>

          {hasAi && !hasHuman && (
            <div className={s.intelligence}>
              {leader?.set.players[0].brain && (
                <>
                  <p className={s.title}>Gen.sib {leader?.set.players[0].brain?.getKey()}</p>
                  <Intelligence intelligence={leader?.set.players[0].brain} headers={headers} />
                </>
              )}
              {leader?.set.players[1].brain && (
                <>
                  <p className={s.title}>Gen.sib {leader?.set.players[1].brain?.getKey()}</p>
                  <Intelligence intelligence={leader?.set.players[1].brain} headers={headers} />
                </>
              )}
              {hasEnvAi && leader?.set.players[1].brain && (
                <>
                  <div className={s.controls}>
                    <Button onClick={save} keyCode='KeyS' trackId='save'>
                      <u>S</u>ave
                    </Button>
                    {/* <Button onClick={mutate} keyCode='KeyM' disabled={!leader} trackId='mutate'>
                          <u>M</u>utate
                        </Button>
                        <Button onClick={kill} disabled={!leader} trackId='kill'>
                          Kill
                        </Button> */}
                  </div>
                </>
              )}
            </div>
          )}

          {envFields && (
            <div className={s.environment}>
              {hasEnvAi && <p className={s.title}>Environment</p>}

              <Environment fields={envFields} />

              {hasEnvAi && (
                <>
                  <p className={s.title}>sibling number</p>

                  <SiblingsMonitor engine={engine} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* <CrossingIllustration />
      <GlobalMinimumIllustration /> */}
    </div>
  )
}

export default App
