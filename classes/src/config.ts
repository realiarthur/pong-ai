let config = {
  VISIBLE_SETS_COUNT: 25,
  KEYBOARD_REPEAT_TIMEOUT: 10,

  boardWidth: 629,
  boardHeight: 391,
  boardPadding: 40,

  ballDiameter: 15,
  paddleWidth: 10,
  paddleHeight: 75,
  maxBounceAngle: Math.PI / 4,

  playerSpeed: 6,

  ballSpeed: 9,
  ballSpeedEnvStep: 0.2,
  ballSpeedEnvFinal: 13,
  maxMutation: 0.1,
  maxMutationEnvStep: -0.003,
  maxMutationEnvFinal: 0.01,
  wallMinAngle: 25,
  wallMinAngleEnvStep: -1,
  wallMinAngleEnvFinal: 0,

  move: 0,
  moveEnvStep: -2,
  moveEnvFinal: -40,
  bounce: 1200,
  bounceEnvStep: -50,
  bounceEnvFinal: 300,
  fail: -2000,
  failEnvStep: -500,
  failEnvFinal: -10000,

  population: 5000,
  divisionThreshold: 10000,
  divisionScore: 10,

  maxThreshold: 0.2,
  maxBias: 0.5,
  populationIncreaseMulti: 0.1,
}

export type Config = typeof config

export const getConfig = () => config

type Updater = 'ui' | 'env'
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
  return () => {
    subscribers = subscribers.filter(item => item !== callback)
  }
}
