let config = {
  KEYBOARD_REPEAT_TIMEOUT: 10,

  boardWidth: 629,
  boardHeight: 391,
  boardPadding: 40,

  ballDiameter: 15,
  paddleWidth: 10,
  paddleHeight: 75,
  maxBounceAngle: Math.PI / 3.5,

  playerSpeed: 6,
  ballSpeed: 9,

  population: 50,
  moveStimulation: 0,
  bounceStimulation: 500,
  failStimulation: -3000,
  maxMutation: 0.2,
  maxThreshold: 0.05,
  maxBias: 0.2,
}

export const getConfig = () => config
export const setConfig = (values: Partial<typeof config>) => {
  config = {
    ...config,
    ...values,
  }
}
