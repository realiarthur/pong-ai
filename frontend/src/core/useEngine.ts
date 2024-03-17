import { useLayoutEffect, useState, useCallback, useEffect } from 'react'
import { EngineClass, getConfig, Controller, Intelligence, GameSet } from 'classes'
import { KeyboardController } from './KeyboardController'
import { PointerController } from './PointerController'

const { VISIBLE_SETS_COUNT } = getConfig()

const engine = new EngineClass()
const keyboardController = new KeyboardController()

const useEngine = () => {
  const [on, setOn] = useState(true)
  const togglePlay = useCallback(() => setOn(value => !value), [])

  const [sets, setSets] = useState<GameSet[]>(engine.sets)
  const forceUpdate = () => {
    setSets([...engine.sets])
  }

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
  }, [on])

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

  const { leader, hasEnvAi } = engine
  const { population, ballSpeed } = getConfig()

  let visibleSets: GameSet[] = sets.slice(0, VISIBLE_SETS_COUNT)
  if (leader && !visibleSets.includes(leader?.set)) {
    visibleSets.push(leader.set)
  }

  const setControllers = (left?: Controller | Intelligence, right?: Controller | Intelligence) => {
    const leftController = left ?? engine.leftController
    const rightController = right ?? engine.rightController
    engine.setControllers(leftController, rightController)
    forceUpdate()
  }

  const mutate = useCallback(() => {
    if (!engine.leader?.player.brain) return
    engine.random(engine.leader.player.brain)
    forceUpdate()
  }, [])

  const kill = useCallback(() => {
    engine.leader = undefined
    engine.killSet(leader?.set)
    forceUpdate()
  }, [])

  const restart = useCallback(() => {
    engine.reset()
    forceUpdate()
  }, [hasEnvAi, population])

  useLayoutEffect(() => {
    if (ballSpeed === 0) {
      setOn(false)
    }
  }, [ballSpeed])

  return {
    engine,
    on,
    setOn,
    togglePlay,
    sets,
    setSets,
    visibleSets,
    forceUpdate,
    restart,
    mutate,
    kill,
    setControllers,
  }
}

export default useEngine
