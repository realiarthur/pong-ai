import { BallClass } from './BallClass';
import { Weights } from './Intelligence';
import { Controller, PlayerClass } from './PlayerClass';
export declare class GameSet {
    ball: BallClass;
    players: [PlayerClass, PlayerClass];
    constructor(leftController?: Controller, rightController?: Controller, dna?: Weights);
    getPlayerIntersectAngle(keeper: PlayerClass): number;
    tick: () => void;
}
