import { GameSet } from './GameSet';
import { PlayerClass } from './PlayerClass';
export declare class EngineClass {
    sets: GameSet[];
    leader?: PlayerClass;
    constructor(set: GameSet[]);
    update(): void;
}
