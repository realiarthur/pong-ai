export const randomChoice = (value1: number, value2: number, probability = 0.5) =>
  Math.random() > probability ? value1 : value2

export const randomChoiceOrder = (value1: number, value2: number, probability = 0.5) =>
  Math.random() > probability ? [value1, value2] : [value2, value1]

export const signRandom = (maxAbs = 1) => 2 * (Math.random() - 0.5) * maxAbs

export const limiter = (value: number, limit = 1) =>
  value > limit ? limit : value < -limit ? -limit : value

export const weighedSum = (inputs: number[], weights: number[]) =>
  inputs.reduce((sum, inputValue, inputIndex) => {
    return sum + inputValue * weights[inputIndex]
  }, 0)

export const weighedAverage = (inputs: number[], weights: number[]) => {
  return weighedSum(inputs, weights) / weights.filter(x => x).length
}
