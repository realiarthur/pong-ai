import { Intelligence, Weights } from './Intelligence';
export type Side = 'left' | 'right';
export type Vector2 = [number, number];
export type Direction = -1 | 1 | 0;
export type Controller = 'keyboard' | 'mouse' | 'ai';
export type PlayerClassProps = {
    side: Side;
    y?: number;
    controller: Controller;
    dna?: Weights;
};
export declare class PlayerClass {
    side: Side;
    xEdge: number;
    xFail: number;
    yTop: number;
    yBottom: number;
    controller: Controller;
    brain?: Intelligence;
    stimulation: number;
    constructor({ side, y, controller, dna, }: PlayerClassProps);
    updatePosition: (direction: Direction) => void;
    stimulate: (x: number) => void;
}
