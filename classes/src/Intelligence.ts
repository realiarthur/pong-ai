import { getConfig } from './config'
const { maxThreshold, maxInitBias } = getConfig()

// inputs: [
//  player.yTop,
//  |player.xEdge|
//  ball.|x|',
//  ball.|x|,
//  ball.y',
//  ball.y,
// ]
// outputs: [up, down]
const LAYERS_CONFIG = [5, 4, 2]

// const INPUT_ANALYSER_CONNECTIONS = [
//   [1, 0, -1, 0, 0, 0], //PBx
//   [0, 1, 0, -1, 0, 0], // PBy
//   [0, 0, 1, 0, -1, 0], // Vx
//   [0, 0, 0, 1, 0, -1], // Vy
//   [0, 0, 1, 0, 0, 0], // Mx
//   [0, 1, 0, 0, 0, 0], // My
// ]

type BiValue = 0 | 1 | -1
export type Layer<T = number, TLength = void> = TLength extends number
  ? T[] & { length: TLength }
  : T[]
export type Weights = number[][][] // layer, input,
export type ActivationFn = (x: number) => number

const thresholdActivation = (x: number, threshold = 0, negative = false): BiValue => {
  if (negative) {
    const abs = Math.abs(x)
    return abs > threshold ? (Math.sign(x) as BiValue) : 0
  } else {
    return x > threshold ? 1 : 0
  }
}

const tanh = (x: number): number => {
  return 2 / (1 + Math.pow(Math.E, -2 * x)) - 1
}

const sigmoid = (x: number): number => {
  return 1 / (1 + Math.pow(Math.E, -x))
}

const limiter = (value: number, limit = 1) =>
  value > limit ? limit : value < -limit ? -limit : value

const signRandom = (maxAbs = 1) => 2 * (Math.random() - 0.5) * maxAbs
const thresholdRandom = () => Math.random() * maxThreshold

const weighedSum = (inputs: Layer, weights: Layer) =>
  inputs.reduce((sum, inputValue, inputIndex) => {
    return sum + inputValue * weights[inputIndex]
  }, 0)

const weighedAverage = (inputs: Layer, weights: Layer) => {
  return weighedSum(inputs, weights) / weights.filter(x => x).length
}

const randomChoice = (value1: number, value2: number) =>
  Math.random() > 0.5 ? [value1, value2] : [value2, value1]

type IntelligenceProps = {
  generation?: number
  siblingIndex?: number
  weights?: Weights
  biases?: Layer[]
  threshold?: number
  layersConfig?: number[]
}

export class Intelligence {
  values: Layer[] = []
  generation: number
  siblingIndex: number
  weights: number[][][] = []
  biases: Layer[] = []
  threshold: number
  layersConfig = LAYERS_CONFIG

  constructor({
    generation,
    siblingIndex,
    weights,
    threshold,
    biases,
    layersConfig,
  }: IntelligenceProps = {}) {
    this.generation = generation ?? 1
    this.siblingIndex = siblingIndex || 0
    this.weights = weights ?? this.mapWeights(() => signRandom())
    this.biases = biases ?? this.mapLayers(() => signRandom(maxInitBias))
    this.threshold = threshold ?? thresholdRandom()
    this.layersConfig = layersConfig ?? LAYERS_CONFIG
  }

  mutate = (siblingIndex: number) => {
    const { maxMutation } = getConfig()
    return new Intelligence({
      generation: this.generation + 1,
      weights: this.mapWeights(weight => {
        const mutatedWeight = weight + signRandom() * maxMutation
        return limiter(mutatedWeight)
      }),
      biases: this.mapLayers(({ bias }) => {
        const mutatedBias = bias ? bias + signRandom(maxInitBias) * maxMutation : 0
        return mutatedBias
      }),
      threshold: limiter(this.threshold + signRandom() * maxMutation * maxThreshold),
      siblingIndex,
    })
  }

  static crossover = (parent1: Intelligence, parent2: Intelligence, siblingIndex: number) => {
    const weightChild2: Layer[][] = []
    const weightChild1 = parent1.mapLayers<Layer>(({ weights, layerIndex, neuronIndex }) => {
      weightChild2[layerIndex] = weightChild2[layerIndex] || []
      weightChild2[layerIndex][neuronIndex] = []
      return weights.map((weight, weightIndex) => {
        const values = randomChoice(weight, parent2.weights[layerIndex][neuronIndex][weightIndex])
        weightChild2[layerIndex][neuronIndex][weightIndex] = values[1]
        return values[0]
      })
    })

    const biasesChild2: Layer[] = []
    const biasesChild1 = parent1.mapLayers(({ bias, layerIndex, neuronIndex }) => {
      biasesChild2[layerIndex] = biasesChild2[layerIndex] || []
      if (!bias) {
        biasesChild2[layerIndex][neuronIndex] = 0
        return 0
      }

      const values = randomChoice(bias, parent2.biases[layerIndex][neuronIndex])
      biasesChild2[layerIndex][neuronIndex] = values[1]

      return values[0]
    })

    const [thresholdChild1, thresholdChild2] = randomChoice(parent1.threshold, parent2.threshold)

    return [
      new Intelligence({
        generation: Math.max(parent1.generation, parent2.generation) + 1,
        weights: weightChild1,
        biases: biasesChild1,
        threshold: thresholdChild1,
        siblingIndex, // TODOC
      }),

      new Intelligence({
        generation: Math.max(parent1.generation, parent2.generation) + 1,
        weights: weightChild2,
        biases: biasesChild2,
        threshold: thresholdChild2,
        siblingIndex: siblingIndex + 1, // TODOC
      }),
    ]
  }

  mapLayers = <TReturn extends number | Layer = number>(
    callback: (neuron: {
      bias: number | null
      weights: Layer
      prevCalcLayer: TReturn[] | null
      layerIndex: number
      neuronIndex: number
    }) => TReturn,
  ) => {
    const result: TReturn[][] = []
    for (let layerIndex = 0; layerIndex < this.layersConfig.length; layerIndex++) {
      const prevCalcLayer = layerIndex > 0 ? result[layerIndex - 1] : null
      result[layerIndex] = []

      for (let neuronIndex = 0; neuronIndex < this.layersConfig[layerIndex]; neuronIndex++) {
        const weights = prevCalcLayer
          ? this.weights[layerIndex]?.[neuronIndex] ?? Array.from({ length: prevCalcLayer?.length })
          : []
        const bias = layerIndex > 0 ? this.biases[layerIndex]?.[neuronIndex] || 0 : null
        result[layerIndex][neuronIndex] = callback({
          bias,
          weights,
          prevCalcLayer,
          layerIndex,
          neuronIndex,
        })
      }
    }
    return result
  }

  mapWeights = (callback: (weight: number) => number): number[][][] => {
    const result = this.mapLayers<Layer>(({ weights }) => {
      return weights.map(callback)
    })

    return result
  }

  calculate = (inputs: Layer): number => {
    this.values = this.mapLayers(({ bias, weights, prevCalcLayer, layerIndex, neuronIndex }) => {
      const isInput = layerIndex === 0 || !prevCalcLayer || !weights.length
      if (isInput) {
        return inputs[neuronIndex] ?? 0
      }

      const isOutput = layerIndex === this.layersConfig.length - 1

      // tanh + bias * inputs
      // const sum = weighedSum(prevCalcLayer, weights)
      // const biased = sum + (bias || 0)
      // const activation = tanh(biased)

      // if (isOutput) {
      //   return thresholdActivation(activation)
      // }

      // linear + bias
      const sum = weighedSum(prevCalcLayer, weights)
      const activation = thresholdActivation(sum, bias || 0)

      return activation
    })

    const outputs = this.values[this.values.length - 1]

    return outputs[0] - outputs[1]
  }

  getOutputWeights = (layer: number, neuron: number) => {
    return (this.weights[layer + 1] || []).map(
      nextLayerNeuronWeights => nextLayerNeuronWeights[neuron],
    )
  }

  serialize = () => {
    const { generation, siblingIndex, weights, threshold, biases, layersConfig } = this
    return JSON.stringify({
      generation,
      siblingIndex,
      weights,
      threshold,
      biases,
      layersConfig,
    })
  }

  static deserialize = (json?: string | null) => {
    if (!json) return
    const values = JSON.parse(json) as IntelligenceProps
    return new Intelligence(values)
  }

  getKey = () => `#${this.generation}.${this.siblingIndex}`
}
