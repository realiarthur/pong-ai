"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallClass = void 0;
var config_1 = require("./config");
var _a = (0, config_1.getConfig)(), boardWidth = _a.boardWidth, boardHeight = _a.boardHeight, ballDiameter = _a.ballDiameter;
var ballRadius = ballDiameter / 2;
var initX = boardWidth / 2;
var initY = boardHeight / 2;
var failLeftLine = -ballRadius;
var failRightLine = boardWidth + ballRadius;
var BallClass = /** @class */ (function () {
    function BallClass(_a) {
        var onFail = _a.onFail;
        var _this = this;
        this.serve = true;
        this.x = -ballDiameter;
        this.y = -ballDiameter;
        this.angle = 0;
        this.angleCos = 0;
        this.angleSin = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = (0, config_1.getConfig)().ballSpeed;
        this.destroy = function () {
            _this.unsubscriber();
        };
        this.respawn = function (center) {
            if (center === void 0) { center = false; }
            _this.serve = true;
            _this.x = initX;
            _this.y = center ? initY : Math.random() * boardHeight;
            var initAngle = ((Math.random() - 0.5) / 1.5) * Math.PI + (Math.sign(Math.random() - 0.5) > 0 ? Math.PI : 0);
            _this.setAngle(initAngle);
        };
        this.setAngle = function (angle) {
            _this.angle = angle;
            _this.angleCos = Math.cos(angle);
            _this.angleSin = Math.sin(angle);
            _this.vx = (_this.serve ? _this.speed / 2.5 : _this.speed) * _this.angleCos;
            _this.vy = (_this.serve ? _this.speed / 2.5 : _this.speed) * _this.angleSin;
        };
        this.update = function () {
            // y
            if (_this.y - ballRadius <= 0 || _this.y + ballRadius >= boardHeight) {
                _this.setAngle(-_this.angle);
            }
            _this.y = _this.y + _this.vy;
            if (_this.y - ballRadius < 0)
                _this.y = ballRadius;
            if (_this.y + ballRadius > boardHeight)
                _this.y = boardHeight - ballRadius;
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
        this.shouldBounced = function (player, prevX) {
            if (!(player.yTop <= _this.y + ballRadius && player.yBottom >= _this.y - ballRadius))
                return;
            var shouldBounce = false;
            if (player.side === 'left') {
                shouldBounce =
                    _this.x - ballRadius <= player.xEdge &&
                        (!(_this.x < player.xFail) || prevX - ballRadius > player.xEdge);
            }
            else {
                shouldBounce =
                    _this.x + ballRadius >= player.xEdge &&
                        (!(_this.x > player.xFail) || prevX + ballRadius < player.xEdge);
            }
            if (shouldBounce) {
                _this.serve = false;
                _this.x = player.xEdge + (player.side === 'left' ? ballRadius : -ballRadius);
            }
            return shouldBounce;
        };
        this.onFail = onFail;
        this.respawn(true);
        this.unsubscriber = (0, config_1.subscribe)(function (config) {
            _this.speed = config.ballSpeed;
        });
    }
    return BallClass;
}());
exports.BallClass = BallClass;
