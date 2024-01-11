export declare class Generation {
    number: number;
    count: number;
    lastSiblingIndex: number;
    constructor(number?: number);
    decrease: (count?: number) => void;
    increase: () => number;
}
