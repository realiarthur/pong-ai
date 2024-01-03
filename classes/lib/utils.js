"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = exports.limiter = void 0;
var limiter = function (value, limit) {
    if (limit === void 0) { limit = 1; }
    return value > limit ? limit : value < -limit ? -limit : value;
};
exports.limiter = limiter;
var random = function (maxAbs, sign) {
    if (maxAbs === void 0) { maxAbs = 1; }
    if (sign === void 0) { sign = false; }
    if (sign) {
        return 2 * (Math.random() - 0.5) * maxAbs;
    }
    else {
        return Math.random() * maxAbs;
    }
};
exports.random = random;
