import { Intelligence } from './Intelligence';
export type Side = 'left' | 'right';
export type Vector2 = [number, number];
export type Direction = -1 | 1 | 0;
export type Controller = 'keys' | 'mouse' | 'ai' | 'wall';
export type StimulateTypes = 'bounce' | 'move' | 'fail';
export type PlayerClassProps = {
    side: Side;
    controller?: Controller;
    height?: number;
    brain?: Intelligence;
};
export declare class PlayerClass {
    side: Side;
    xEdge: number;
    xFail: number;
    yTop: number;
    yBottom: number;
    controller: Controller;
    brain?: Intelligence;
    score: number;
    stimulation: number;
    height: number;
    constructor({ side, height, controller, brain }: PlayerClassProps);
    updatePosition: (direction: Direction) => void;
    stimulate: (type: StimulateTypes) => void;
    addScore: () => void;
    reset: () => void;
}
