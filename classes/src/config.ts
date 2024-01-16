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

  playerSpeed: 6,

  ballSpeed: 12,
  ballSpeedEnvStep: 0.3,
  ballSpeedEnvFinal: 15,
  maxMutation: 0.05,
  maxMutationEnvStep: -0.003,
  maxMutationEnvFinal: 0.01,
  wallMinAngle: 20,
  wallMinAngleEnvStep: -2,
  wallMinAngleEnvFinal: 0,

  move: -1,
  moveEnvStep: -2,
  moveEnvFinal: -45,
  bounce: 1000,
  bounceEnvStep: -50,
  bounceEnvFinal: 300,
  fail: -1000,
  failEnvStep: -500,
  failEnvFinal: -15000,

  population: 5000,
  divisionThreshold: 10000,
  deathThreshold: -10000,
  divisionScore: 10,

  maxThreshold: 0.2,
  maxBias: 1,
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
