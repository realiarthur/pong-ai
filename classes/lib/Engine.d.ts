import { BallClass } from './Ball';
import { PlayerClass } from './PlayerClass';
export declare class Engine {
    players: PlayerClass[];
    balls: BallClass[];
    constructor(players: PlayerClass[], balls: BallClass[]);
    update(): void;
}
