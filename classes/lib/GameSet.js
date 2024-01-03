"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSet = void 0;
var config_1 = require("./config");
var uid_1 = require("uid");
var _a = (0, config_1.getConfig)(), paddleHeight = _a.paddleHeight, maxBounceAngle = _a.maxBounceAngle, boardWidth = _a.boardWidth, boardHeight = _a.boardHeight, paddleWidth = _a.paddleWidth, boardPadding = _a.boardPadding;
var playerMaxY = boardHeight - paddleHeight;
var maxBallDistance = boardWidth - 2 * (paddleWidth + boardPadding);
var GameSet = /** @class */ (function () {
    function GameSet(players, ball) {
        var _this = this;
        this.uid = (0, uid_1.uid)();
        this.tick = function () {
            var _a = _this, ball = _a.ball, _b = _a.players, left = _b[0], right = _b[1];
            if (left.brain) {
                var direction = left.brain.calculate([
                    left.yTop / playerMaxY,
                    (ball.x - left.xEdge) / maxBallDistance,
                    ball.y / boardHeight,
                    ball.angleCos,
                    ball.angleSin,
                ])[0];
                left.updatePosition(direction);
            }
            if (right.brain) {
                var direction = right.brain.calculate([
                    right.yTop / playerMaxY,
                    (right.xEdge - ball.x) / maxBallDistance,
                    _this.ball.y / boardHeight,
                    -ball.angleCos,
                    ball.angleSin,
                ])[0];
                right.updatePosition(direction);
            }
            if (_this.ball.shouldBounced(left)) {
                var bounceAngle = _this.getPlayerIntersectAngle(left);
                _this.ball.setAngle(bounceAngle);
                left.stimulate('bounce');
            }
            if (_this.ball.shouldBounced(right)) {
                var bounceAngle = _this.getPlayerIntersectAngle(right);
                _this.ball.setAngle(bounceAngle);
                right.stimulate('bounce');
            }
        };
        this.players = players;
        this.ball = ball;
    }
    // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
    GameSet.prototype.getPlayerIntersectAngle = function (keeper) {
        if (keeper.controller === 'wall') {
            return 2 * (Math.random() - 0.5) * maxBounceAngle;
        }
        var relativeIntersectY = keeper.yTop + keeper.height / 2 - this.ball.y;
        var bounceAngle = -(relativeIntersectY / (keeper.height / 2)) * maxBounceAngle;
        return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle;
    };
    return GameSet;
}());
exports.GameSet = GameSet;
