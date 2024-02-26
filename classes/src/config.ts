let config = {
  VISIBLE_SETS_COUNT: 25,
  KEYBOARD_REPEAT_TIMEOUT: 10,

  boardWidth: 629,
  boardHeight: 421,
  boardPadding: 40,

  ballDiameter: 15,
  paddleWidth: 10,
  paddleHeight: 75,
  maxBounceAngle: Math.PI / 4.5,

  playerSpeed: 12,
  aiSpeed: 8,
  genePoolThreshold: 0.01,

  ballSpeed: 13,
  ballSpeedEnvStep: 0.35,
  ballSpeedEnvFinal: 20,
  maxMutation: 0.1,
  maxMutationEnvStep: -0.003,
  maxMutationEnvFinal: 0.01,
  wallMinAngle: 20,
  wallMinAngleEnvStep: 1,
  wallMinAngleEnvFinal: 40,

  bounce: 1500,
  bounceEnvStep: -100,
  bounceEnvFinal: 300,
  fail: -1000,
  failEnvStep: -1000,
  failEnvFinal: -20000,

  population: 5000,
  divisionThreshold: 10000,
  deathThreshold: -10000,
  divisionScore: 10,

  maxInitBias: 0.5,
  populationIncreaseMulti: 0.01,
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

export const stimulateTypes = ['bounce', 'fail'] as const
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
