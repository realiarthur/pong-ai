"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generation = void 0;
var Generation = /** @class */ (function () {
    function Generation(number) {
        var _this = this;
        this.number = 0;
        this.count = 0;
        this.lastSiblingIndex = -1;
        this.decrease = function (count) {
            if (count === void 0) { count = 1; }
            _this.count = _this.count - count;
        };
        this.increase = function () {
            _this.count = _this.count + 1;
            _this.lastSiblingIndex = _this.lastSiblingIndex + 1;
            return _this.lastSiblingIndex;
        };
        this.number = number !== null && number !== void 0 ? number : 0;
    }
    return Generation;
}());
exports.Generation = Generation;
