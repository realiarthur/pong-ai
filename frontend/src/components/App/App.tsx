import { useLayoutEffect, useReducer, useRef, useState } from 'react'
import Board from 'components/Board/Board'
import s from './App.module.css'
import { EngineClass, GameSet, Weights, config } from 'classes'

const initializeEngine = (dna?: Weights) => {
  const sets = Array.from({ length: config.population }, () => new GameSet('keyboard', 'ai', dna))
  return new EngineClass(sets)
}

const randomInit = initializeEngine()

const App = () => {
  const engineRef = useRef(randomInit)
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

      engineRef.current.update()
      forceUpdate()
      requestAnimationFrame(update)
    }
    update()

    return cancel
  }, [on])

  const restart = () => {
    engineRef.current = initializeEngine()
  }

  const mutate = () => {
    engineRef.current = initializeEngine(engineRef.current.leader?.brain?.weights)
  }

  const load = () => {
    const weights = localStorage.getItem('leader')
    if (weights) {
      engineRef.current = initializeEngine(JSON.parse(weights))
    }
  }

  return (
    <div className={s.app}>
      <div className={s.score}>
        <span></span>
        <span>{engineRef.current.leader?.stimulation}</span>
      </div>
      <Board sets={engineRef.current.sets} leader={engineRef.current.leader} />

      <div className={s.controls}>
        <button onClick={restart}>Restart</button>
        <button onClick={() => setOn(value => !value)}>{on ? 'Stop' : 'Continue'}</button>
        <button onClick={() => engineRef.current.leader?.brain?.save()}>Save</button>
        <button onClick={load}>Load</button>
        <button onClick={mutate}>Mutate</button>
      </div>
    </div>
  )
}

export default App
