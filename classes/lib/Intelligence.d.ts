export type Layer<T = number, TLength = void> = TLength extends number ? T[] & {
    length: TLength;
} : T[];
export type Weights = number[][][];
export declare class Intelligence {
    weights: number[][][];
    constructor(weights?: Weights);
    static mapWeights: (callback: (layerIndex: number, inputIndex: number, outputIndex: number) => number) => Weights;
    calculate: (inputs: number[], calculatedLayerIndex?: number) => number[];
    save: () => void;
}
