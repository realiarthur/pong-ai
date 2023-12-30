export type Side = 'left' | 'right';
export type Vector2 = [number, number];
export declare class PlayerClass {
    side: Side;
    xEdge: number;
    yTop: number;
    yBottom: number;
    callback: () => void;
    constructor(side: Side, y?: number);
    updatePosition: (delta: -1 | 1) => void;
    render(callback: () => void): void;
}
