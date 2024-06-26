export const weighedSum = (inputs: number[], weights: number[]) =>
  inputs.reduce((sum, inputValue, inputIndex) => {
    return sum + inputValue * weights[inputIndex]
  }, 0)

export const weighedAverage = (inputs: number[], weights: number[]) => {
  return weighedSum(inputs, weights) / weights.filter(x => x).length
}

export const limiter = (value: number, limit = 1) =>
  value > limit ? limit : value < -limit ? -limit : value

export const threshold = (x: number, threshold = 0, negative = false): -1 | 1 | 0 => {
  if (negative) {
    const abs = Math.abs(x)
    return abs > threshold ? (Math.sign(x) as -1 | 1) : 0
  } else {
    return x > threshold ? 1 : 0
  }
}

export const tanh = (x: number): number => {
  return 2 / (1 + Math.pow(Math.E, -2 * x)) - 1
}

export const sigmoid = (x: number): number => {
  return 1 / (1 + Math.pow(Math.E, -x))
}
