"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallClass = void 0;
var config_1 = require("./config");
var boardWidth = config_1.config.boardWidth, boardHeight = config_1.config.boardHeight, ballSpeed = config_1.config.ballSpeed, ballRadius = config_1.config.ballRadius;
var halfBallWidth = ballRadius / 2;
var initX = boardWidth / 2 - halfBallWidth;
var initY = boardHeight / 2 - halfBallWidth;
var failLeftLine = -halfBallWidth;
var failRightLine = boardWidth + halfBallWidth;
var BallClass = /** @class */ (function () {
    function BallClass(_a) {
        var onFail = _a.onFail, _b = _a.speed, speed = _b === void 0 ? ballSpeed : _b;
        var _this = this;
        this.x = -ballRadius;
        this.y = -ballRadius;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = ballSpeed;
        this.respawn = function () {
            _this.x = initX;
            _this.y = initY;
            var initAngle = ((Math.random() - 0.5) / 1.5) * Math.PI + (Math.sign(Math.random() - 0.5) > 0 ? Math.PI : 0);
            _this.setAngle(initAngle);
        };
        this.setAngle = function (angle) {
            _this.angle = angle;
            _this.vx = _this.speed * Math.cos(angle);
            _this.vy = _this.speed * Math.sin(angle);
        };
        this.update = function () {
            // y
            if (_this.y - halfBallWidth <= 0 || _this.y + halfBallWidth >= boardHeight) {
                _this.vy = -_this.vy;
            }
            _this.y = _this.y + _this.vy;
            // if (this.y < 0) this.y = 0
            // if (this.y + ballRadius > boardHeight) this.y = boardHeight - ballRadius
            // x
            _this.x = _this.x + _this.vx;
            if (_this.x <= failLeftLine) {
                _this.onFail('left');
                _this.respawn();
            }
            if (_this.x >= failRightLine) {
                _this.onFail('right');
                _this.respawn();
            }
        };
        this.shouldBounced = function (player) {
            if (!(player.yTop <= _this.y + halfBallWidth && player.yBottom >= _this.y - halfBallWidth))
                return;
            if (player.side === 'left') {
                return _this.x - halfBallWidth <= player.xEdge && !(_this.x < player.xFail);
            }
            else {
                return _this.x + halfBallWidth >= player.xEdge && !(_this.x + halfBallWidth > player.xFail);
            }
        };
        this.onFail = onFail;
        this.speed = speed;
        this.respawn();
    }
    return BallClass;
}());
exports.BallClass = BallClass;
