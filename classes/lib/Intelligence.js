"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intelligence = void 0;
var config_1 = require("./config");
var _a = (0, config_1.getConfig)(), maxThreshold = _a.maxThreshold, maxBias = _a.maxBias;
// inputs: [
//  player.yTop,
//  |player.xEdge|
//  ball.|x|',
//  ball.|x|,
//  ball.y',
//  ball.y,
// ]
// outputs: [up, down]
var INPUT_COUNT = 6;
var HIDDEN_COUNT = 6;
var HIDDEN_COUNT2 = 3;
var OUTPUT_COUNT = 1;
var LAYERS_CONFIG = [INPUT_COUNT, HIDDEN_COUNT, HIDDEN_COUNT2, OUTPUT_COUNT];
var thresholdActivation = function (x, threshold) {
    if (threshold === void 0) { threshold = 0; }
    var abs = Math.abs(x);
    return abs > threshold ? (x / abs) : 0;
};
var limiter = function (value, limit) {
    if (limit === void 0) { limit = 1; }
    return value > limit ? limit : value < -limit ? -limit : value;
};
var signRandom = function (maxAbs) {
    if (maxAbs === void 0) { maxAbs = 1; }
    return 2 * (Math.random() - 0.5) * maxAbs;
};
var thresholdRandom = function () { return Math.random() * maxThreshold; };
var weighedSum = function (inputs, weights, outputIndex) {
    return inputs.reduce(function (sum, inputValue, inputIndex) {
        return sum + inputValue * weights[inputIndex][outputIndex];
    }, 0);
};
var weighedAverage = function (inputs, weights, outputIndex) {
    return weighedSum(inputs, weights, outputIndex) / inputs.length;
};
var Intelligence = /** @class */ (function () {
    function Intelligence(_a) {
        var _b = _a === void 0 ? {} : _a, generation = _b.generation, siblingIndex = _b.siblingIndex, weights = _b.weights, threshold = _b.threshold, biases = _b.biases;
        var _this = this;
        this.values = [];
        this.weights = [];
        this.biases = [];
        this.mutate = function (siblingIndex) {
            var maxMutation = (0, config_1.getConfig)().maxMutation;
            return new Intelligence({
                generation: _this.generation + 1,
                weights: Intelligence.mapWeights(function (layer, input, output) {
                    var mutatedWeight = _this.weights[layer][input][output] + signRandom() * maxMutation;
                    return limiter(mutatedWeight);
                }),
                biases: Intelligence.mapBiases(function (layer, neuron) {
                    var mutatedBias = _this.biases[layer][neuron] + signRandom(maxBias) * maxMutation;
                    return limiter(mutatedBias);
                }),
                threshold: limiter(_this.threshold + signRandom() * maxMutation * maxThreshold),
                siblingIndex: siblingIndex,
            });
        };
        this.calculate = function (inputs, calculatedLayerIndex) {
            if (calculatedLayerIndex === void 0) { calculatedLayerIndex = 1; }
            var weights = _this.weights[calculatedLayerIndex - 1];
            var biases = _this.biases[calculatedLayerIndex];
            var outputsCount = LAYERS_CONFIG[calculatedLayerIndex];
            var isOutputLayer = calculatedLayerIndex === LAYERS_CONFIG.length - 1;
            if (calculatedLayerIndex === 1) {
                _this.values[0] = inputs;
            }
            var outputs = [];
            for (var outputIndex = 0; outputIndex < outputsCount; outputIndex++) {
                var value = weighedAverage(inputs, weights, outputIndex);
                var biasedValue = limiter(value + biases[outputIndex]);
                // const activation: ActivationFn = isOutputLayer
                //   ? x => thresholdActivation(x, this.threshold)
                //   : x => x
                var activation = function (x) { return thresholdActivation(x, _this.threshold); };
                outputs.push(activation(biasedValue));
            }
            _this.values[calculatedLayerIndex] = outputs;
            return isOutputLayer ? outputs : _this.calculate(outputs, calculatedLayerIndex + 1);
        };
        this.serialize = function () {
            var _a = _this, generation = _a.generation, siblingIndex = _a.siblingIndex, weights = _a.weights, threshold = _a.threshold, biases = _a.biases;
            return JSON.stringify({
                generation: generation,
                siblingIndex: siblingIndex,
                weights: weights,
                threshold: threshold,
                biases: biases,
            });
        };
        this.generation = generation !== null && generation !== void 0 ? generation : 1;
        this.siblingIndex = siblingIndex || 0;
        this.weights = weights !== null && weights !== void 0 ? weights : Intelligence.mapWeights(function () { return signRandom(); });
        this.biases = biases !== null && biases !== void 0 ? biases : Intelligence.mapBiases(function () { return 0; });
        this.threshold = threshold !== null && threshold !== void 0 ? threshold : thresholdRandom();
    }
    // TODOC use mapLayer
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
    Intelligence.mapBiases = function (callback) {
        return Intelligence.mapLayer(function (layerIndex, neuronIndex) {
            if (layerIndex > 0) {
                return callback(layerIndex, neuronIndex);
            }
            return 0;
        });
    };
    Intelligence.mapLayer = function (callback) {
        var _a;
        var result = [];
        for (var layerIndex = 0; layerIndex < LAYERS_CONFIG.length; layerIndex++) {
            result[layerIndex] = (_a = result[layerIndex]) !== null && _a !== void 0 ? _a : [];
            for (var neuronIndex = 0; neuronIndex < LAYERS_CONFIG[layerIndex]; neuronIndex++) {
                result[layerIndex][neuronIndex] = callback(layerIndex, neuronIndex);
            }
        }
        return result;
    };
    Intelligence.deserialize = function (json) {
        if (!json)
            return;
        var values = JSON.parse(json);
        return new Intelligence(values);
    };
    return Intelligence;
}());
exports.Intelligence = Intelligence;
