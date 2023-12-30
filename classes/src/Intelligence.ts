import { config } from './config'
const { mutationDelta } = config

// inputs: [
//  player.yTop,
//  x distance to ball,
//  ball.y,
//  ball.vx (negative if ball move to player),
//  ball.vy,
// ]
// outputs: [up, down]
const INPUT_COUNT = 5
const HIDDEN_COUNT = 6
const OUTPUT_COUNT = 2
const LAYERS_CONFIG = [INPUT_COUNT, HIDDEN_COUNT, OUTPUT_COUNT]

type BiValue = 0 | 1
export type Layer<T = number, TLength = void> = TLength extends number
  ? T[] & { length: TLength }
  : T[]
export type Weights = number[][][] // layer, input, output

const sigmoid = (x: number) => {
  return 1 / (1 + Math.exp(-x))
}

export class Intelligence {
  weights: number[][][] = []

  constructor(weights?: Weights) {
    if (weights) {
      this.weights = Intelligence.mapWeights((layer, input, output) => {
        return weights[layer][input][output] + (Math.random() - 0.5) * mutationDelta
      })
    } else {
      this.weights = Intelligence.mapWeights(() => Math.random())
    }
  }

  static mapWeights = (
    callback: (layerIndex: number, inputIndex: number, outputIndex: number) => number,
  ) => {
    const result: Weights = []
    for (let layerIndex = 0; layerIndex < LAYERS_CONFIG.length - 1; layerIndex++) {
      result[layerIndex] = result[layerIndex] ?? []

      for (let inputIndex = 0; inputIndex < LAYERS_CONFIG[layerIndex]; inputIndex++) {
        result[layerIndex][inputIndex] = result[layerIndex][inputIndex] ?? []

        for (let outputIndex = 0; outputIndex < LAYERS_CONFIG[layerIndex + 1]; outputIndex++) {
          result[layerIndex][inputIndex][outputIndex] = callback(
            layerIndex,
            inputIndex,
            outputIndex,
          )
        }
      }
    }
    return result
  }

  calculate = (inputs: Layer, calculatedLayerIndex = 1): Layer => {
    const weights = this.weights[calculatedLayerIndex - 1]
    const outputsCount = LAYERS_CONFIG[calculatedLayerIndex]

    if (calculatedLayerIndex === 1) {
      inputs = inputs.map(sigmoid)
    }

    const outputs: Layer = []
    for (let outputIndex = 0; outputIndex < outputsCount; outputIndex++) {
      const output = inputs.reduce((sum, inputValue, inputIndex) => {
        return sum + inputValue * weights[inputIndex][outputIndex]
      }, 0)
      outputs.push(sigmoid(output))
    }

    return calculatedLayerIndex < LAYERS_CONFIG.length - 1
      ? this.calculate(outputs, calculatedLayerIndex + 1)
      : outputs
  }

  save = () => {
    localStorage.setItem('leader', JSON.stringify(this.weights))
  }
}
