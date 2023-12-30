"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
var Engine = /** @class */ (function () {
    function Engine(players, balls) {
        this.players = players;
        this.balls = balls;
    }
    Engine.prototype.update = function () {
        this.players = __spreadArray([], this.players, true); // TODOC
        this.balls.forEach(function (ball) { return ball.update; });
    };
    return Engine;
}());
exports.Engine = Engine;
