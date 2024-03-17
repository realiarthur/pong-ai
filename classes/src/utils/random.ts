export const randomBoolean = () => Math.random() > 0.5

export const randomSign = () => Math.sign(Math.random() - 0.5)

export const randomChoice = (value1: number, value2: number, probability = 0.5) =>
  Math.random() > probability ? value1 : value2

export const randomChoiceOrder = (value1: number, value2: number, probability = 0.5) =>
  Math.random() > probability ? [value1, value2] : [value2, value1]

export const signRandom = (maxAbs = 1) => 2 * (Math.random() - 0.5) * maxAbs
