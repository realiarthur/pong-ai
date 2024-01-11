import { PlayerClass, Side } from './PlayerClass';
type BallProps = {
    speed?: number;
    onFail: (side: Side) => void;
};
export declare class BallClass {
    serve: boolean;
    x: number;
    y: number;
    angle: number;
    angleCos: number;
    angleSin: number;
    vx: number;
    vy: number;
    speed: number;
    onFail: (side: Side) => void;
    unsubscriber: () => void;
    constructor({ onFail }: BallProps);
    destroy: () => void;
    respawn: (center?: boolean) => void;
    setAngle: (angle: number) => void;
    update: () => void;
    shouldBounced: (player: PlayerClass, prevX: number) => boolean | undefined;
}
export {};
