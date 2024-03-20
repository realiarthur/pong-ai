import { getConfig } from './config'
import { weighedSum, limiter, threshold, tanh } from './utils/neuronUtils'
import { signRandom, randomChoiceOrder } from './utils/random'

const { maxInitBias, maxMutation: initMaxMutation } = getConfig()
const LAYERS_CONFIG = [5, 4, 2]

export type Layer<T = number, TLength = void> = TLength extends number
  ? T[] & { length: TLength }
  : T[]
export type Weights = number[][][] // layer, input,
export type ActivationFn = (x: number) => number

type IntelligenceProps = {
  generation?: number
  siblingIndex?: number
  weights?: Weights
  biases?: Layer[]
  layersConfig?: number[]
  birthTime?: number
}

export class Intelligence {
  generation: number
  siblingIndex: number
  birthTime: number
  layersConfig = LAYERS_CONFIG
  weights: number[][][] = []
  biases: Layer[] = []
  values: Layer[] = []
  key: string

  constructor({
    generation,
    siblingIndex,
    birthTime,
    layersConfig,
    weights,
    biases,
  }: IntelligenceProps = {}) {
    this.key = `#${generation}.${siblingIndex}`
    this.generation = generation ?? 1
    this.siblingIndex = siblingIndex || 0
    this.birthTime = birthTime ?? Date.now()
    this.layersConfig = layersConfig ?? LAYERS_CONFIG
    this.weights = weights ?? this.mapWeights(() => signRandom())
    this.biases = biases ?? this.mapLayers(() => signRandom(maxInitBias))
  }

  mutate = (siblingIndex: number, maxMutation = initMaxMutation) => {
    return new Intelligence({
      generation: this.generation + 1,
      weights: this.mapWeights(weight => {
        return limiter(weight + signRandom() * maxMutation)
      }),
      biases: this.mapLayers(({ bias }) => {
        return limiter(bias ? bias + signRandom(maxInitBias) * maxMutation : 0)
      }),
      siblingIndex,
    })
  }

  mapLayers = <TReturn extends number | Layer = number>(
    callback: (neuron: {
      bias: number | null
      weights: Layer
      prevLayerResult: TReturn[] | null
      layerIndex: number
      neuronIndex: number
    }) => TReturn,
  ) => {
    const result: TReturn[][] = []

    for (let layerIndex = 0; layerIndex < this.layersConfig.length; layerIndex++) {
      const prevLayerResult = layerIndex > 0 ? result[layerIndex - 1] : null
      result[layerIndex] = []

      for (let neuronIndex = 0; neuronIndex < this.layersConfig[layerIndex]; neuronIndex++) {
        const weights = this.weights[layerIndex]?.[neuronIndex] ?? []
        const bias = layerIndex > 0 ? this.biases[layerIndex]?.[neuronIndex] || 0 : null

        result[layerIndex][neuronIndex] = callback({
          bias,
          weights,
          prevLayerResult,
          layerIndex,
          neuronIndex,
        })
      }
    }

    return result
  }

  mapWeights = (callback: (weight: number) => number): number[][][] => {
    const result = this.mapLayers<Layer>(({ weights, prevLayerResult }) => {
      const weightsArray: number[] = weights.length
        ? weights
        : Array.from({ length: prevLayerResult?.length || 0 })

      return weightsArray.map(callback)
    })

    return result
  }

  calculate = (inputs: Layer): number => {
    this.values = this.mapLayers(({ bias, weights, prevLayerResult, layerIndex, neuronIndex }) => {
      const isInput = layerIndex === 0 || !prevLayerResult || !weights?.length
      if (isInput) {
        return inputs[neuronIndex] ?? 0
      }

      const sum = weighedSum(prevLayerResult, weights)
      const activation = threshold(sum, bias || 0)
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
    const { generation, siblingIndex, weights, biases, layersConfig, birthTime } = this
    return JSON.stringify({
      generation,
      siblingIndex,
      weights,
      biases,
      layersConfig,
      birthTime,
    })
  }

  static deserialize = (json?: string | null) => {
    if (!json) return
    const values = JSON.parse(json) as IntelligenceProps
    return new Intelligence(values)
  }

  static crossover = (
    parent1: Intelligence,
    parent2: Intelligence,
    generation: number,
    siblingIndex: number,
  ) => {
    const weightChild2: Layer[][] = []
    const weightChild1 = parent1.mapLayers<Layer>(({ weights, layerIndex, neuronIndex }) => {
      weightChild2[layerIndex] = weightChild2[layerIndex] || []
      weightChild2[layerIndex][neuronIndex] = []
      return weights.map((weight, weightIndex) => {
        const values = randomChoiceOrder(
          weight,
          parent2.weights[layerIndex][neuronIndex][weightIndex],
        )
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

      const values = randomChoiceOrder(bias, parent2.biases[layerIndex][neuronIndex])
      biasesChild2[layerIndex][neuronIndex] = values[1]

      return values[0]
    })

    return [
      new Intelligence({
        generation: generation,
        weights: weightChild1,
        biases: biasesChild1,
        siblingIndex,
      }),

      new Intelligence({
        generation: generation,
        weights: weightChild2,
        biases: biasesChild2,
        siblingIndex: siblingIndex + 1,
      }),
    ]
  }
}
