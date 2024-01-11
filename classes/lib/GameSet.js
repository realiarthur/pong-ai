"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSet = void 0;
var config_1 = require("./config");
var _a = (0, config_1.getConfig)(), paddleHeight = _a.paddleHeight, maxBounceAngle = _a.maxBounceAngle, boardWidth = _a.boardWidth, boardHeight = _a.boardHeight;
var playerMaxY = boardHeight - paddleHeight;
var getBounceStimulation = function (bounceAngle) {
    var _a = (0, config_1.getConfig)(), move = _a.move, moveEnvFinal = _a.moveEnvFinal;
    return 1 + (0.5 * ((move / moveEnvFinal) * bounceAngle)) / maxBounceAngle;
};
var GameSet = /** @class */ (function () {
    function GameSet(players, ball, key) {
        var _this = this;
        this.dead = false;
        this.kill = function () {
            _this.dead = true;
        };
        // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
        this.tick = function () {
            var _a = _this, ball = _a.ball, _b = _a.players, left = _b[0], right = _b[1];
            var prevX = ball.x, prevY = ball.y;
            ball.update();
            //  player.yTop,
            //  |player.xEdge|
            //  ball.|x|',
            //  ball.|x|,
            //  ball.y',
            //  ball.y,
            if (left.brain) {
                var direction = left.brain.calculate([
                    left.yTop / playerMaxY,
                    left.xEdge / boardWidth,
                    prevX / boardWidth,
                    ball.x / boardWidth,
                    prevY / boardHeight,
                    ball.y / boardHeight,
                ])[0];
                left.updatePosition(direction);
            }
            if (right.brain) {
                var direction = right.brain.calculate([
                    right.yTop / playerMaxY,
                    (boardWidth - right.xEdge) / boardWidth,
                    (boardWidth - prevX) / boardWidth,
                    (boardWidth - ball.x) / boardWidth,
                    prevY / boardHeight,
                    ball.y / boardHeight,
                ])[0];
                right.updatePosition(direction);
            }
            var getPlayerIntersectAngle = function (keeper) {
                if (keeper.controller === 'env') {
                    var wallMinAngle = (0, config_1.getConfig)().wallMinAngle;
                    var wallMinRadAngle = (wallMinAngle / 180) * Math.PI;
                    var bounceAngle_1 = (wallMinRadAngle + (maxBounceAngle - wallMinRadAngle) * Math.random()) *
                        (Math.random() > 0.5 ? 1 : -1);
                    return keeper.side === 'left' ? bounceAngle_1 : Math.PI - bounceAngle_1;
                }
                var relativeIntersectY = keeper.yTop + keeper.height / 2 - _this.ball.y;
                var bounceAngle = -(relativeIntersectY / (keeper.height / 2)) * maxBounceAngle;
                return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle;
            };
            if (ball.shouldBounced(left, prevX)) {
                var bounceAngle = getPlayerIntersectAngle(left);
                ball.setAngle(bounceAngle);
                left.stimulate('bounce', getBounceStimulation(bounceAngle));
            }
            if (ball.shouldBounced(right, prevX)) {
                var bounceAngle = getPlayerIntersectAngle(right);
                ball.setAngle(bounceAngle);
                right.stimulate('bounce', getBounceStimulation(bounceAngle));
            }
        };
        this.players = players;
        this.ball = ball;
        this.key = key;
    }
    return GameSet;
}());
exports.GameSet = GameSet;
