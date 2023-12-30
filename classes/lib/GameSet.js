"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSet = void 0;
var BallClass_1 = require("./BallClass");
var PlayerClass_1 = require("./PlayerClass");
var config_1 = require("./config");
var paddleHeight = config_1.config.paddleHeight, maxBounceAngle = config_1.config.maxBounceAngle;
var GameSet = /** @class */ (function () {
    function GameSet(leftController, rightController, dna) {
        if (leftController === void 0) { leftController = 'keyboard'; }
        if (rightController === void 0) { rightController = 'ai'; }
        var _this = this;
        this.tick = function () {
            var _a = _this, ball = _a.ball, _b = _a.players, left = _b[0], right = _b[1];
            if (left.brain) {
                var _c = left.brain.calculate([
                    left.yTop,
                    ball.x - left.xEdge,
                    ball.y,
                    ball.vx,
                    ball.vy,
                ]), up = _c[0], down = _c[1];
                var direction = down - up > 0 ? 1 : -1; // TODOC
                left.updatePosition(direction);
            }
            if (right.brain) {
                var _d = right.brain.calculate([
                    right.yTop,
                    right.xEdge - ball.x,
                    _this.ball.y,
                    -_this.ball.vx,
                    _this.ball.vy,
                ]), up = _d[0], down = _d[1];
                var direction = down - up > 0 ? 1 : -1; // TODOC
                right.updatePosition(direction);
            }
            if (_this.ball.shouldBounced(left)) {
                var bounceAngle = _this.getPlayerIntersectAngle(left);
                _this.ball.setAngle(bounceAngle);
                left.stimulate(100);
            }
            if (_this.ball.shouldBounced(right)) {
                var bounceAngle = _this.getPlayerIntersectAngle(right);
                _this.ball.setAngle(bounceAngle);
                right.stimulate(100);
            }
            _this.ball.update();
        };
        this.players = [
            new PlayerClass_1.PlayerClass({
                side: 'left',
                controller: leftController,
                dna: leftController === 'ai' ? dna : undefined,
            }),
            new PlayerClass_1.PlayerClass({
                side: 'right',
                controller: rightController,
                dna: rightController === 'ai' ? dna : undefined,
            }),
        ];
        this.ball = new BallClass_1.BallClass({
            onFail: function (side) {
                var player = side === 'left' ? _this.players[0] : _this.players[1];
                player.stimulate(-300);
            },
        });
    }
    // https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
    GameSet.prototype.getPlayerIntersectAngle = function (keeper) {
        var relativeIntersectY = keeper.yTop + paddleHeight / 2 - this.ball.y;
        var bounceAngle = -(relativeIntersectY / (paddleHeight / 2)) * maxBounceAngle;
        return keeper.side === 'left' ? bounceAngle : Math.PI - bounceAngle;
    };
    return GameSet;
}());
exports.GameSet = GameSet;
