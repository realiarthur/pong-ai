import { GameSet } from './GameSet';
import { Intelligence } from './Intelligence';
import { Controller, PlayerClass } from './PlayerClass';
type Leader = {
    index: number;
    set: GameSet;
    player: PlayerClass;
};
export declare class EngineClass {
    sets: GameSet[];
    lookingForLeader: boolean;
    leader?: Leader;
    leftController: Controller;
    rightController: Controller;
    commonLeftPlayer?: PlayerClass;
    commonRightPlayer?: PlayerClass;
    setControllers: (leftController?: Controller, rightController?: Controller) => void;
    update(): void;
    createSets: (leaderIntelligence?: Intelligence, count?: number) => void;
    mutateLeader: () => void;
    loadLeader: () => void;
    saveLeader: () => void;
    restart: () => void;
}
export {};
