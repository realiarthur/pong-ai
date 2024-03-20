import { useEffect, Fragment, ChangeEventHandler, ChangeEvent } from 'react'
import Board from 'components/Board/Board'
import cx from 'classnames'

import { getConfig, setConfig, controllers, Controller, Side } from 'classes'

import Intelligence from 'components/Intelligence/Intelligence'
import Environment, { EnvFields } from 'components/Environment/Environment'
import SiblingsMonitor from 'components/SiblingsMonitor/SiblingsMonitor'
import Button, { Tab } from 'components/Button/Button'

import { useSetCssConst } from 'core/setCssConst'
import useEngine from 'core/useEngine'

import s from './App.module.css'
import useWakeLock from 'core/useWakeLock'
import { useSavedPlayers } from 'core/useSavedPlayers'

const initialConfig = getConfig()

type Theme = 'dark' | 'light'
const initTheme: Theme = 'dark'
document.body.className = initTheme

const inputHeaders = ['pY', "bX'", 'bY', "cos'", 'sin']

const App = () => {
  useSetCssConst()

  const {
    engine: {
      leader,
      statistic,
      leftController,
      rightController,
      hasOnlyAi,
      hasEnvAi,
      hasAi,
      hasHuman,
      hasPointer,
    },
    on,
    setOn,
    togglePlay,
    sets,
    restart,
    setControllers,
    forceUpdate,
  } = useEngine()

  const [savedPlayers, save] = useSavedPlayers()

  useWakeLock(on)

  useEffect(() => {
    if (!hasEnvAi || sets.length > 0) return

    if (window.confirm(`Save gen.sib ${leader?.player.brain?.key || ''}?`)) {
      save(leader?.player)
      compare()
    }
  }, [hasEnvAi, sets.length])

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
              disabled: !!statistic.iterations.length || !!statistic.generationsStat[1]?.dead,
            },
          ],
        ],
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

  const compare = () => {
    const players = Object.values(savedPlayers)
    setControllers(players[1] ?? players[0], players[0])
    setConfig({ ballSpeed: 20 })
    forceUpdate()
    setOn(true)
  }
  const play = () => {
    const players = Object.values(savedPlayers)
    const controller: Controller = 'ontouchstart' in document.documentElement ? 'pointer' : 'keys'
    setControllers(controller, players[0])
    setConfig({ ballSpeed: 20 })
    forceUpdate()
    setOn(true)
  }
  const train = () => {
    setControllers('env', 'ai')
    setConfig(initialConfig)
    forceUpdate()
    setOn(true)
  }

  useEffect(() => {
    play()
  }, [])

  const handleChangeController = (side: Side) => (e: ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value
    const controller = !!savedPlayers[key] ? savedPlayers[key] : (key as Controller)
    const args = side === 'left' ? [controller] : [undefined, controller]
    setControllers(...args)
  }

  const tab = hasHuman ? 'play' : hasOnlyAi ? 'compare' : 'train'

  return (
    <div className={cx(s.app)}>
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
                value={typeof leftController === 'string' ? leftController : leftController.key}
                onChange={handleChangeController('left')}
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
                value={typeof rightController === 'string' ? rightController : rightController.key}
                onChange={handleChangeController('right')}
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
            <Board
              sets={sets}
              leader={leader?.player}
              leaderSet={leader?.set}
              hasPointer={hasPointer}
            />

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
                  <p className={s.title}>Gen.sib {leader?.set.players[0].brain?.key}</p>
                  <Intelligence
                    intelligence={leader?.set.players[0].brain}
                    headers={inputHeaders}
                  />
                </>
              )}
              {leader?.set.players[1].brain && (
                <>
                  <p className={s.title}>Gen.sib {leader?.set.players[1].brain?.key}</p>
                  <Intelligence
                    intelligence={leader?.set.players[1].brain}
                    headers={inputHeaders}
                  />
                </>
              )}
              {hasEnvAi && leader?.set.players[1].brain && (
                <>
                  <div className={s.controls}>
                    <Button
                      onClick={() => {
                        save(leader.player)
                      }}
                      keyCode='KeyS'
                      trackId='save'
                    >
                      <u>S</u>ave
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className={s.environment}>
            {hasEnvAi && <p className={s.title}>Environment</p>}

            <Environment fields={envFields} />

            {hasEnvAi && (
              <>
                <p className={s.title}>sibling number</p>
                <SiblingsMonitor statistic={statistic} leader={leader} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
