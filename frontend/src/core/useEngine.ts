import { useLayoutEffect, useState, useCallback, useEffect, useRef } from 'react'
import { EngineClass, getConfig, Controller, Intelligence, GameSet, subscribe } from 'classes'
import { KeyboardController } from './KeyboardController'
import { PointerController } from './PointerController'

const { VISIBLE_SETS_COUNT } = getConfig()

let engine = new EngineClass()
let keyboardController = new KeyboardController()

const useEngine = () => {
  const [on, setOn] = useState(true)
  const togglePlay = useCallback(() => setOn(value => !value), [])

  const [sets, setSets] = useState<GameSet[]>(engine.sets)

  const forceUpdate = useCallback(() => {
    const { leader } = engine
    const visibleSets: GameSet[] = engine.sets.slice(0, VISIBLE_SETS_COUNT)
    if (leader && !visibleSets.includes(leader?.set)) {
      visibleSets.push(leader.set)
    }
    setSets(visibleSets)
  }, [engine, setSets])

  useLayoutEffect(() => {
    if (!on) return

    let shouldUpdate = true

    const tick = () => {
      if (!shouldUpdate) return

      if (engine.hasKeys && engine.sets[0]) {
        engine.sets[0].players[0].updatePosition(keyboardController?.getDirection() || 0)
      }

      engine.tick()
      forceUpdate()

      requestAnimationFrame(tick)
    }
    tick()

    return () => {
      shouldUpdate = false
    }
  }, [on, engine, keyboardController, forceUpdate])

  useEffect(() => {
    const unsubscriber = subscribe(({ ballSpeed }) => {
      if (ballSpeed === 0) {
        setOn(false)
      }
    })

    return () => {
      unsubscriber()
    }
  }, [])

  useEffect(() => {
    if (engine.hasPointer && sets[0]) {
      const boardElement = document.getElementById('board')
      if (!boardElement) return

      const pointerController = new PointerController(boardElement, sets[0].players[0])

      return () => {
        pointerController.destroy()
      }
    }
  }, [engine.leftController, sets[0]])

  // useCallback is needed for use key
  const restart = useCallback(() => {
    engine.reset()
    forceUpdate()
  }, [engine, forceUpdate])

  const setControllers = (left?: Controller | Intelligence, right?: Controller | Intelligence) => {
    const leftController = left ?? engine.leftController
    const rightController = right ?? engine.rightController
    engine.setControllers(leftController, rightController)
    forceUpdate()
  }

  return {
    engine,
    on,
    setOn,
    togglePlay,
    sets,
    setSets,
    forceUpdate,
    setControllers,
    restart,
  }
}

export default useEngine
