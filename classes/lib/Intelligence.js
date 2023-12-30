"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intelligence = void 0;
var config_1 = require("./config");
var mutationDelta = config_1.config.mutationDelta;
// inputs: [
//  player.yTop,
//  x distance to ball,
//  ball.y,
//  ball.vx (negative if ball move to player),
//  ball.vy,
// ]
// outputs: [up, down]
var INPUT_COUNT = 5;
var HIDDEN_COUNT = 6;
var OUTPUT_COUNT = 2;
var LAYERS_CONFIG = [INPUT_COUNT, HIDDEN_COUNT, OUTPUT_COUNT];
var sigmoid = function (x) {
    return 1 / (1 + Math.exp(-x));
};
var Intelligence = /** @class */ (function () {
    function Intelligence(weights) {
        var _this = this;
        this.weights = [];
        this.calculate = function (inputs, calculatedLayerIndex) {
            if (calculatedLayerIndex === void 0) { calculatedLayerIndex = 1; }
            var weights = _this.weights[calculatedLayerIndex - 1];
            var outputsCount = LAYERS_CONFIG[calculatedLayerIndex];
            if (calculatedLayerIndex === 1) {
                inputs = inputs.map(sigmoid);
            }
            var outputs = [];
            var _loop_1 = function (outputIndex) {
                var output = inputs.reduce(function (sum, inputValue, inputIndex) {
                    return sum + inputValue * weights[inputIndex][outputIndex];
                }, 0);
                outputs.push(sigmoid(output));
            };
            for (var outputIndex = 0; outputIndex < outputsCount; outputIndex++) {
                _loop_1(outputIndex);
            }
            return calculatedLayerIndex < LAYERS_CONFIG.length - 1
                ? _this.calculate(outputs, calculatedLayerIndex + 1)
                : outputs;
        };
        this.save = function () {
            localStorage.setItem('leader', JSON.stringify(_this.weights));
        };
        if (weights) {
            this.weights = Intelligence.mapWeights(function (layer, input, output) {
                return weights[layer][input][output] + (Math.random() - 0.5) * mutationDelta;
            });
        }
        else {
            this.weights = Intelligence.mapWeights(function () { return Math.random(); });
        }
    }
    Intelligence.mapWeights = function (callback) {
        var _a, _b;
        var result = [];
        for (var layerIndex = 0; layerIndex < LAYERS_CONFIG.length - 1; layerIndex++) {
            result[layerIndex] = (_a = result[layerIndex]) !== null && _a !== void 0 ? _a : [];
            for (var inputIndex = 0; inputIndex < LAYERS_CONFIG[layerIndex]; inputIndex++) {
                result[layerIndex][inputIndex] = (_b = result[layerIndex][inputIndex]) !== null && _b !== void 0 ? _b : [];
                for (var outputIndex = 0; outputIndex < LAYERS_CONFIG[layerIndex + 1]; outputIndex++) {
                    result[layerIndex][inputIndex][outputIndex] = callback(layerIndex, inputIndex, outputIndex);
                }
            }
        }
        return result;
    };
    return Intelligence;
}());
exports.Intelligence = Intelligence;
