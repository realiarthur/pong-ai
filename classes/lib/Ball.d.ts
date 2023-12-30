type BallProps = {
    x: number;
    y: number;
    speed: number;
};
export declare class BallClass {
    x: number;
    y: number;
    vx: number;
    vy: number;
    constructor({ x, y, speed }: BallProps);
    update(): void;
}
export {};
