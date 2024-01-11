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
  ballSpeedEnvStep: 1,
  ballSpeedEnvFinal: 15,
  maxMutation: 0.1,
  maxMutationEnvStep: -0.003,
  maxMutationEnvFinal: 0.01,
  wallMinAngle: 10,
  wallMinAngleEnvStep: 2,
  wallMinAngleEnvFinal: 30,

  move: 0,
  moveEnvStep: 0,
  moveEnvFinal: -40,
  bounce: 500,
  bounceEnvStep: -50,
  bounceEnvFinal: 300,
  fail: -1000,
  failEnvStep: -1000,
  failEnvFinal: -15000,

  population: 5000,
  divisionThreshold: 10000,
  deathThreshold: -10000,
  divisionScore: 10,

  maxThreshold: 0.2,
  maxBias: 0.5,
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
