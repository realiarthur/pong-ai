"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallClass = void 0;
var config_1 = require("./config");
var initX = config_1.config.boardWidth / 2;
var initY = config_1.config.boardHeight / 2;
var BallClass = /** @class */ (function () {
    function BallClass(_a) {
        var _b = _a.x, x = _b === void 0 ? initX : _b, _c = _a.y, y = _c === void 0 ? initY : _c, speed = _a.speed;
        this.x = x;
        this.y = y;
        this.vx = speed;
        this.vy = 0;
    }
    BallClass.prototype.update = function () {
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
    };
    return BallClass;
}());
exports.BallClass = BallClass;
