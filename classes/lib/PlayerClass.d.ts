import { Intelligence } from './Intelligence';
export type Side = 'left' | 'right';
export type Vector2 = [number, number];
export type Direction = -1 | 1 | 0;
export declare const controllers: readonly ["env", "ai", "keys"];
export type Controller = (typeof controllers)[number];
export declare const stimulateTypes: readonly ["bounce", "move", "fail"];
export type StimulateType = (typeof stimulateTypes)[number];
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
    height: number;
    controller: Controller;
    brain?: Intelligence;
    score: number;
    stimulation: number;
    movementsSinceBounce: number;
    dead: boolean;
    previousMove: number;
    constructor({ side, height, controller, brain }: PlayerClassProps);
    kill: () => void;
    updatePosition: (direction: Direction) => void;
    stimulate: (typeOrValue: StimulateType | number, multi?: number) => void;
    addScore: () => void;
    reset: () => void;
}
