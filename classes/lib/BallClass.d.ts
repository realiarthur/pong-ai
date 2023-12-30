import { PlayerClass, Side } from './PlayerClass';
type BallProps = {
    speed?: number;
    onFail: (side: Side) => void;
};
export declare class BallClass {
    x: number;
    y: number;
    angle: number;
    vx: number;
    vy: number;
    speed: number;
    onFail: (side: Side) => void;
    constructor({ onFail, speed }: BallProps);
    respawn: () => void;
    setAngle: (angle: number) => void;
    update: () => void;
    shouldBounced: (player: PlayerClass) => boolean | undefined;
}
export {};
