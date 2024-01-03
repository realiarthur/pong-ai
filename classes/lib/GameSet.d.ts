import { BallClass } from './BallClass';
import { PlayerClass } from './PlayerClass';
export declare class GameSet {
    uid: string;
    ball: BallClass;
    players: readonly [PlayerClass, PlayerClass];
    constructor(players: readonly [PlayerClass, PlayerClass], ball: BallClass);
    getPlayerIntersectAngle(keeper: PlayerClass): number;
    tick: () => void;
}
