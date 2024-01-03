"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.getConfig = void 0;
var config = {
    KEYBOARD_REPEAT_TIMEOUT: 10,
    boardWidth: 629,
    boardHeight: 391,
    boardPadding: 40,
    ballDiameter: 15,
    paddleWidth: 10,
    paddleHeight: 75,
    maxBounceAngle: Math.PI / 3.5,
    playerSpeed: 6,
    ballSpeed: 9,
    population: 50,
    moveStimulation: 0,
    bounceStimulation: 500,
    failStimulation: -3000,
    maxMutation: 0.2,
    maxThreshold: 0.05,
    maxBias: 0.2,
};
var getConfig = function () { return config; };
exports.getConfig = getConfig;
var setConfig = function (values) {
    config = __assign(__assign({}, config), values);
};
exports.setConfig = setConfig;
