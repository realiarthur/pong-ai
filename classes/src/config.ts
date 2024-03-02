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

  ballSpeed: 20,

  wallMinAngle: 40,

  fail: -1,

  maxMutation: 0.1,
  maxInitBias: 0.5,

  population: 1000,
  deathScore: 21,
  surviversCount: 100,
  populationIncreaseMulti: 0.01,
  crossover: false,
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
