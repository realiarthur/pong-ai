import { getConfig } from './config'
const { maxMutation, maxThreshold, maxBias } = getConfig()

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
const OUTPUT_COUNT = 1
const LAYERS_CONFIG = [INPUT_COUNT, HIDDEN_COUNT, OUTPUT_COUNT]

type BiValue = 0 | 1 | -1
export type Layer<T = number, TLength = void> = TLength extends number
  ? T[] & { length: TLength }
  : T[]
export type Weights = number[][][] // layer, input,
export type ActivationFn = (x: number) => number

const thresholdActivation = (x: number, threshold = 0): BiValue => {
  const abs = Math.abs(x)
  return abs > threshold ? ((x / abs) as -1 | 1) : 0
}

const limiter = (value: number, limit = 1) =>
  value > limit ? limit : value < -limit ? -limit : value

const signRandom = (maxAbs = 1) => 2 * (Math.random() - 0.5) * maxAbs
const thresholdRandom = () => Math.random() * maxThreshold

const weighedSum = (inputs: Layer, weights: Layer[], outputIndex: number) =>
  inputs.reduce((sum, inputValue, inputIndex) => {
    return sum + inputValue * weights[inputIndex][outputIndex]
  }, 0)

const weighedAverage = (inputs: Layer, weights: Layer[], outputIndex: number) =>
  weighedSum(inputs, weights, outputIndex) / inputs.length

type IntelligenceProps = {
  generation?: number
  weights?: Weights
  biases?: Layer[]
  threshold?: number
}

export class Intelligence {
  values: Layer[] = []
  generation: number
  weights: number[][][] = []
  biases: Layer[] = []
  threshold: number

  constructor({ generation, weights, threshold, biases }: IntelligenceProps = {}) {
    this.generation = generation ?? 1
    this.weights = weights ?? Intelligence.mapWeights(() => signRandom())
    this.biases = biases ?? Intelligence.mapBiases(() => signRandom(maxBias))
    this.threshold = threshold ?? thresholdRandom()
  }

  mutate = () => {
    return new Intelligence({
      generation: this.generation + 1,
      weights: Intelligence.mapWeights((layer, input, output) => {
        const mutatedWeight = this.weights[layer][input][output] + signRandom() * maxMutation
        return limiter(mutatedWeight)
      }),
      biases: Intelligence.mapBiases((layer, neuron) => {
        const mutatedBias = this.biases[layer][neuron] + signRandom(maxBias) * maxMutation
        return limiter(mutatedBias, maxBias)
      }),
      threshold: limiter(this.threshold + signRandom() * maxMutation * maxThreshold, maxThreshold),
    })
  }

  // TODOC use mapLayer
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

  static mapBiases = (callback: (layerIndex: number, neuronIndex: number) => number) => {
    return Intelligence.mapLayer((layerIndex, neuronIndex) => {
      if (layerIndex > 0) {
        return callback(layerIndex, neuronIndex)
      }

      return 0
    })
  }

  static mapLayer = (callback: (layerIndex: number, neuronIndex: number) => number) => {
    const result: Layer[] = []
    for (let layerIndex = 0; layerIndex < LAYERS_CONFIG.length; layerIndex++) {
      result[layerIndex] = result[layerIndex] ?? []

      for (let neuronIndex = 0; neuronIndex < LAYERS_CONFIG[layerIndex]; neuronIndex++) {
        result[layerIndex][neuronIndex] = callback(layerIndex, neuronIndex)
      }
    }
    return result
  }

  calculate = (inputs: Layer, calculatedLayerIndex = 1): Layer => {
    const weights = this.weights[calculatedLayerIndex - 1]
    const biases = this.biases[calculatedLayerIndex]
    const outputsCount = LAYERS_CONFIG[calculatedLayerIndex]
    const isOutputLayer = calculatedLayerIndex === LAYERS_CONFIG.length - 1

    if (calculatedLayerIndex === 1) {
      this.values[0] = inputs
    }

    const outputs: Layer = []
    for (let outputIndex = 0; outputIndex < outputsCount; outputIndex++) {
      const value = weighedAverage(inputs, weights, outputIndex)
      const biasedValue = limiter(value + biases[outputIndex])
      const activation: ActivationFn = isOutputLayer
        ? x => thresholdActivation(x, this.threshold)
        : x => x
      outputs.push(activation(biasedValue))
    }

    this.values[calculatedLayerIndex] = outputs

    return isOutputLayer ? outputs : this.calculate(outputs, calculatedLayerIndex + 1)
  }

  serialize = () => {
    const { generation, weights, threshold, biases } = this
    return JSON.stringify({
      generation,
      weights,
      threshold,
      biases,
    })
  }

  static deserialize = (json?: string | null) => {
    if (!json) return
    const values = JSON.parse(json) as IntelligenceProps
    return new Intelligence(values)
  }
}
