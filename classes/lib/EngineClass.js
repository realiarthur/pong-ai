"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineClass = void 0;
var EngineClass = /** @class */ (function () {
    function EngineClass(set) {
        this.sets = set;
    }
    EngineClass.prototype.update = function () {
        var _this = this;
        this.sets.forEach(function (set) {
            var _a;
            set.tick();
            if (set.players[1].stimulation > (((_a = _this.leader) === null || _a === void 0 ? void 0 : _a.stimulation) || 0)) {
                _this.leader = set.players[1];
            }
        });
    };
    return EngineClass;
}());
exports.EngineClass = EngineClass;
