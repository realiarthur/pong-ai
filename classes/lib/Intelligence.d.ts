export type Layer<T = number, TLength = void> = TLength extends number ? T[] & {
    length: TLength;
} : T[];
export type Weights = number[][][];
export type ActivationFn = (x: number) => number;
type IntelligenceProps = {
    generation?: number;
    siblingIndex?: number;
    weights?: Weights;
    biases?: Layer[];
    threshold?: number;
};
export declare class Intelligence {
    values: Layer[];
    generation: number;
    siblingIndex: number;
    weights: number[][][];
    biases: Layer[];
    threshold: number;
    constructor({ generation, siblingIndex, weights, threshold, biases }?: IntelligenceProps);
    mutate: (siblingIndex: number) => Intelligence;
    static mapWeights: (callback: (layerIndex: number, inputIndex: number, outputIndex: number) => number) => Weights;
    static mapBiases: (callback: (layerIndex: number, neuronIndex: number) => number) => number[][];
    static mapLayer: (callback: (layerIndex: number, neuronIndex: number) => number) => number[][];
    calculate: (inputs: number[], calculatedLayerIndex?: number) => number[];
    serialize: () => string;
    static deserialize: (json?: string | null) => Intelligence | undefined;
}
export {};
