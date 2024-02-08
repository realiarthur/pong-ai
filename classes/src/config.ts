let config = {
  VISIBLE_SETS_COUNT: 25,
  KEYBOARD_REPEAT_TIMEOUT: 10,

  boardWidth: 629,
  boardHeight: 391,
  boardPadding: 40,

  ballDiameter: 15,
  paddleWidth: 10,
  paddleHeight: 75,
  maxBounceAngle: Math.PI / 4.5,

  playerSpeed: 8,

  ballSpeed: 12,
  ballSpeedEnvStep: 0.3,
  ballSpeedEnvFinal: 16,
  maxMutation: 0.1,
  maxMutationEnvStep: -0.003,
  maxMutationEnvFinal: 0.01,
  wallMinAngle: 20,
  wallMinAngleEnvStep: 1,
  wallMinAngleEnvFinal: 40,

  move: 0,
  moveEnvStep: -2,
  moveEnvFinal: -30,
  bounce: 1000,
  bounceEnvStep: -50,
  bounceEnvFinal: 300,
  fail: -500,
  failEnvStep: -500,
  failEnvFinal: -20000,
  middle: 0,
  middleEnvStep: 1,
  middleEnvFinal: 5,

  population: 5000,
  divisionThreshold: 10000,
  deathThreshold: -10000,
  divisionScore: 10,

  maxThreshold: 0.5,
  maxInitBias: 0.5,
  populationIncreaseMulti: 0.1,
}

export type Config = typeof config

export const getConfig = () => config

type Updater = 'ui' | 'env' | 'init'
export function setConfig(values: Partial<Config>, updater?: Updater): void
export function setConfig(fn: (prevValues: Config) => Partial<Config>, updater?: Updater): void
export function setConfig(
  valuesOrFn: Partial<Config> | ((prevValues: Config) => Partial<Config>),
  updater: Updater = 'env',
) {
  const values = typeof valuesOrFn === 'function' ? valuesOrFn(config) : valuesOrFn

  config = {
    ...config,
    ...values,
  }

  subscribers.forEach(callback => callback(config, updater))
}

type Callback = (config: Config, updater: Updater) => void
let subscribers: Callback[] = []
export const subscribe = (callback: Callback) => {
  subscribers.push(callback)
  callback(config, 'init')
  return () => {
    subscribers = subscribers.filter(item => item !== callback)
  }
}

export const stimulateTypes = ['bounce', 'move', 'fail', 'middle'] as const
export type StimulateType = (typeof stimulateTypes)[number]
export const envConfig = [...stimulateTypes, 'ballSpeed', 'maxMutation', 'wallMinAngle'] as const

export const shiftEnvironment = () => {
  setConfig(config => {
    return envConfig.reduce((result, type) => {
      const value = config[type]
      const step = config[`${type}EnvStep`]
      const final = config[`${type}EnvFinal`]

      if (value === final || step === 0) {
        return result
      }

      const newValue = Math.round((value + step) * 1000) / 1000
      const hasExceedFinal = step > 0 ? newValue > final : newValue < final

      return {
        ...result,
        [type]: hasExceedFinal ? final : newValue,
      }
    }, {} as Partial<Config>)
  })
}
