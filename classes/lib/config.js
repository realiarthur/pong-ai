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
exports.subscribe = exports.setConfig = exports.getConfig = void 0;
var config = {
    VISIBLE_SETS_COUNT: 25,
    KEYBOARD_REPEAT_TIMEOUT: 10,
    boardWidth: 629,
    boardHeight: 391,
    boardPadding: 40,
    ballDiameter: 15,
    paddleWidth: 10,
    paddleHeight: 75,
    maxBounceAngle: Math.PI / 4,
    playerSpeed: 6,
    ballSpeed: 9,
    ballSpeedEnvStep: 0.2,
    ballSpeedEnvFinal: 13,
    maxMutation: 0.1,
    maxMutationEnvStep: -0.003,
    maxMutationEnvFinal: 0.01,
    wallMinAngle: 25,
    wallMinAngleEnvStep: -1,
    wallMinAngleEnvFinal: 0,
    move: 0,
    moveEnvStep: -2,
    moveEnvFinal: -40,
    bounce: 1200,
    bounceEnvStep: -50,
    bounceEnvFinal: 300,
    fail: -2000,
    failEnvStep: -500,
    failEnvFinal: -10000,
    population: 5000,
    divisionThreshold: 10000,
    divisionScore: 10,
    maxThreshold: 0.2,
    maxBias: 0.5,
    populationIncreaseMulti: 0.1,
};
var getConfig = function () { return config; };
exports.getConfig = getConfig;
function setConfig(valuesOrFn, updater) {
    if (updater === void 0) { updater = 'env'; }
    var values = typeof valuesOrFn === 'function' ? valuesOrFn(config) : valuesOrFn;
    config = __assign(__assign({}, config), values);
    subscribers.forEach(function (callback) { return callback(config, updater); });
}
exports.setConfig = setConfig;
var subscribers = [];
var subscribe = function (callback) {
    subscribers.push(callback);
    return function () {
        subscribers = subscribers.filter(function (item) { return item !== callback; });
    };
};
exports.subscribe = subscribe;
