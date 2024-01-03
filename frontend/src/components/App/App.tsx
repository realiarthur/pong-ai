import { useLayoutEffect, useReducer, useRef, useState } from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, getConfig } from 'classes'
import Intelligence from 'components/Intelligence/Intelligence'
import { getNumberString } from 'utils/getNumberString'
import Config from 'components/Config/Config'

const engine = new EngineClass()
engine.setControllers('ai', 'ai')

const { loadLeader, saveLeader, mutateLeader, createSets, restart } = engine

const headers = ['pY', '|ΔX|', 'bY', 'NbVx', 'bVy']
// const headers = ['pY', "ΔX'", "bY'", 'ΔX', 'bY']

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

  return (
    <div className={s.app}>
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

            <div className={s.controls}>
              <button onClick={() => setOn(value => !value)}>{on ? 'Pause' : 'Play'}</button>
              <button onClick={() => restart()}>Restart</button>
            </div>

            <span className={s.score}>{engine.leader?.set.players[1].score}</span>
          </div>
          <Board sets={engine.sets} leader={engine.leader?.player} leaderSet={engine.leader?.set} />
        </div>

        <div className={s.intelligence}>
          {engine.leader?.set.players[1].brain && (
            <>
              <p className={s.generation}>
                Generation #{engine.leader?.player.brain?.generation}.{engine.leader?.index}
              </p>

              <div className={s.desc}>
                <p className={s.motivationScore}>
                  best motivation: {engine.leader?.player.stimulation}
                </p>
                <p>
                  activation threshold: {getNumberString(engine.leader?.player.brain?.threshold)}
                </p>
              </div>

              <Intelligence intelligence={engine.leader?.set.players[1].brain} headers={headers} />

              <div className={s.controls}>
                <button onClick={() => createSets()}>Random</button>
                <button onClick={() => mutateLeader()}>Mutate</button>
                <button onClick={() => saveLeader()}>Save</button>
                <button onClick={() => loadLeader()}>Load</button>
              </div>

              <Config />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
