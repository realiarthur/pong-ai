import { BallClass } from './BallClass';
import { PlayerClass } from './PlayerClass';
export declare class GameSet {
    ball: BallClass;
    players: readonly [PlayerClass, PlayerClass];
    key: string;
    dead: boolean;
    constructor(players: readonly [PlayerClass, PlayerClass], ball: BallClass, key: string);
    kill: () => void;
    tick: () => void;
}
