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
exports.EngineClass = void 0;
var BallClass_1 = require("./BallClass");
var GameSet_1 = require("./GameSet");
var Generation_1 = require("./Generation");
var Intelligence_1 = require("./Intelligence");
var PlayerClass_1 = require("./PlayerClass");
var config_1 = require("./config");
var LOCAL_STORAGE_LEADER = 'leader';
var VISIBLE_SETS_COUNT = (0, config_1.getConfig)().VISIBLE_SETS_COUNT;
var forEachRight = function (array, callback) {
    for (var index = array.length - 1; index >= 0; index--) {
        var element = array[index];
        callback(element, index);
    }
};
var initConfig = (0, config_1.getConfig)();
var EngineClass = /** @class */ (function () {
    function EngineClass() {
        var _this = this;
        this.sets = [];
        this.setsCount = 0;
        this.lookingForLeader = false;
        this.leftController = 'keys';
        this.rightController = 'ai';
        this.generationsStat = [];
        this.population = 0;
        this.config = initConfig;
        this.hasAi = false;
        this.hasOnlyAi = false;
        this.hasEnv = false;
        this.hasEnvAi = false;
        this.destroy = function () {
            _this.unsubscriber();
        };
        this.setControllers = function (leftController, rightController) {
            if (leftController === void 0) { leftController = 'env'; }
            if (rightController === void 0) { rightController = 'ai'; }
            _this.leftController = leftController;
            _this.rightController = rightController;
            _this.hasAi = _this.leftController === 'ai' || _this.rightController === 'ai';
            _this.hasOnlyAi = _this.leftController === 'ai' && _this.rightController === 'ai';
            _this.hasEnv = _this.leftController === 'env' || _this.rightController === 'env';
            _this.hasEnvAi = _this.hasAi && _this.hasEnv;
            _this.sets = [];
        };
        this.update = function () {
            var _a, _b, _c;
            if (!_this.sets.length)
                return { sets: [], length: 0 };
            var _d = _this.config, divisionThreshold = _d.divisionThreshold, divisionScore = _d.divisionScore, population = _d.population, populationIncreaseMulti = _d.populationIncreaseMulti, fail = _d.fail;
            _this.leader = _this.watchIndividual;
            if ((_a = _this.watchIndividual) === null || _a === void 0 ? void 0 : _a.set.dead) {
                _this.watchIndividual = undefined;
            }
            if (_this.watchGeneration && !((_b = _this.generationsStat[_this.watchGeneration]) === null || _b === void 0 ? void 0 : _b.count)) {
                _this.watchGeneration = _this.getLastGenerationWithCount();
            }
            var currentWatchGeneration = (_c = _this.watchGeneration) !== null && _c !== void 0 ? _c : _this.getLastGenerationWithCount();
            // right to let last generation has children faster
            forEachRight(_this.sets, function (generation) {
                if (!generation)
                    return;
                generation.forEach(function (set) {
                    set.tick();
                    set.players.forEach(function (player, playerIndex) {
                        var _a, _b, _c, _d;
                        if (!player.brain)
                            return;
                        if (!_this.watchIndividual) {
                            var isWatchedGeneration = !currentWatchGeneration || player.brain.generation === currentWatchGeneration;
                            var isAiGameLeader = _this.hasOnlyAi &&
                                playerIndex === 1 &&
                                player.score > ((_b = (_a = _this.leader) === null || _a === void 0 ? void 0 : _a.player.score) !== null && _b !== void 0 ? _b : -divisionThreshold);
                            var isEnvGameLeader = _this.hasEnvAi &&
                                player.stimulation > ((_d = (_c = _this.leader) === null || _c === void 0 ? void 0 : _c.player.stimulation) !== null && _d !== void 0 ? _d : -divisionThreshold);
                            if (isWatchedGeneration && (isAiGameLeader || isEnvGameLeader)) {
                                _this.leader = {
                                    set: set,
                                    player: player,
                                };
                            }
                        }
                        var maxPopulation = _this.hasOnlyAi ? population / 2 : population;
                        var envGameDivision = _this.hasEnvAi && divisionThreshold && player.stimulation >= divisionThreshold;
                        var aiAiGameDivision = _this.hasOnlyAi && player.score >= divisionScore;
                        if ((envGameDivision || aiAiGameDivision) &&
                            _this.setsCount <= maxPopulation * (1 - populationIncreaseMulti)) {
                            if (_this.hasOnlyAi) {
                                if (playerIndex === 1) {
                                    _this.createSet(player.brain);
                                }
                                _this.killSet(player.brain.generation, set);
                                return;
                            }
                            if (!player.brain)
                                return;
                            player.stimulation = 0;
                            player.score = 0;
                            var maxGeneration = _this.generationsStat.length - 1 || 1;
                            _this.createSets(player.brain);
                            if (player.brain.generation === maxGeneration) {
                                console.log('complication for new generation:', player.brain.generation + 1);
                                (0, config_1.setConfig)(function (config) {
                                    return PlayerClass_1.stimulateTypes.reduce(function (result, type) {
                                        var _a;
                                        var value = config[type];
                                        var step = config["".concat(type, "EnvStep")];
                                        var final = config["".concat(type, "EnvFinal")];
                                        var hasReachedFinal = value === final || step === 0 || (step > 0 ? value > final : value < final);
                                        if (hasReachedFinal) {
                                            return result;
                                        }
                                        return __assign(__assign({}, result), (_a = {}, _a[type] = value + step, _a));
                                    }, {});
                                });
                            }
                        }
                        if (_this.hasEnvAi && player.stimulation <= Math.max(-divisionThreshold, 3 * fail)) {
                            _this.killSet(player.brain.generation, set);
                        }
                    });
                });
            });
            var visibleSets = [];
            for (var index = 0; index < _this.sets.length; index++) {
                var generation = _this.sets[index];
                if (!generation)
                    continue;
                visibleSets = __spreadArray(__spreadArray([], visibleSets, true), generation, true);
                if (visibleSets.length > VISIBLE_SETS_COUNT) {
                    visibleSets = visibleSets.slice(0, VISIBLE_SETS_COUNT);
                    break;
                }
            }
            return { sets: visibleSets, length: _this.setsCount };
        };
        this.createGeneration = function (number) {
            var generation = new Generation_1.Generation(number);
            _this.generationsStat[number] = generation;
            return generation;
        };
        this.getLastGenerationWithCount = function () {
            var _a;
            return ((_a = __spreadArray([], _this.generationsStat, true).reverse().find(function (item) { return item === null || item === void 0 ? void 0 : item.count; })) === null || _a === void 0 ? void 0 : _a.number) || 0;
        };
        this.createGenerationSibling = function (parent) {
            var _a;
            _this.population = _this.population + 1;
            var generationNumber = ((parent === null || parent === void 0 ? void 0 : parent.generation) || 0) + 1;
            var generation = (_a = _this.generationsStat[generationNumber]) !== null && _a !== void 0 ? _a : _this.createGeneration(generationNumber);
            var siblingIndex = generation.increase();
            if (!parent) {
                return new Intelligence_1.Intelligence({
                    generation: generationNumber,
                    siblingIndex: siblingIndex,
                });
            }
            return parent.mutate(siblingIndex);
        };
        this.createSets = function (parent, count) {
            var _a, _b, _c, _d;
            if (count === void 0) { count = _this.config.population * _this.config.populationIncreaseMulti; }
            for (var index = 0; index < count; index++) {
                var set = _this.createSet(parent);
                if (!((_a = set.players[1].brain) === null || _a === void 0 ? void 0 : _a.generation))
                    return;
                if (!_this.sets[(_b = set.players[1].brain) === null || _b === void 0 ? void 0 : _b.generation]) {
                    _this.sets[(_c = set.players[1].brain) === null || _c === void 0 ? void 0 : _c.generation] = [];
                }
                _this.sets[(_d = set.players[1].brain) === null || _d === void 0 ? void 0 : _d.generation].push(_this.createSet(parent));
            }
        };
        this.createSet = function (parent, mutate) {
            var _a, _b, _c, _d, _e, _f;
            if (mutate === void 0) { mutate = true; }
            var createAi = function () {
                if (parent && !mutate) {
                    return parent;
                }
                return _this.createGenerationSibling(parent);
            };
            var players = [
                (_a = _this.commonLeftPlayer) !== null && _a !== void 0 ? _a : new PlayerClass_1.PlayerClass({
                    side: 'left',
                    controller: _this.leftController,
                    brain: _this.hasOnlyAi ? parent : _this.leftController === 'ai' ? createAi() : undefined,
                }),
                (_b = _this.commonRightPlayer) !== null && _b !== void 0 ? _b : new PlayerClass_1.PlayerClass({
                    side: 'right',
                    controller: _this.rightController,
                    brain: _this.hasOnlyAi
                        ? _this.createGenerationSibling(parent)
                        : _this.rightController === 'ai'
                            ? createAi()
                            : undefined,
                }),
            ];
            var key = "".concat(_this.leftController, " - ").concat(_this.rightController);
            if (_this.leftController === 'ai') {
                key = "".concat((_c = players[0].brain) === null || _c === void 0 ? void 0 : _c.generation, ".").concat((_d = players[0].brain) === null || _d === void 0 ? void 0 : _d.siblingIndex);
            }
            else if (_this.rightController === 'ai') {
                key = "".concat((_e = players[1].brain) === null || _e === void 0 ? void 0 : _e.generation, ".").concat((_f = players[1].brain) === null || _f === void 0 ? void 0 : _f.siblingIndex);
            }
            var ball = new BallClass_1.BallClass({
                onFail: function (side) {
                    if (side === 'left') {
                        players[1].addScore();
                        players[0].stimulate('fail');
                    }
                    else {
                        players[0].addScore();
                        players[1].stimulate('fail');
                    }
                },
            });
            return new GameSet_1.GameSet(players, ball, key);
        };
        this.killSet = function (generation, set) {
            if (generation === undefined || set === undefined)
                return;
            set.kill();
            var index = _this.sets[generation].indexOf(set);
            if (index === -1)
                return;
            _this.population = _this.population - (_this.hasOnlyAi ? 2 : 1);
            _this.sets[generation][index].players.forEach(function (player) {
                var _a;
                if (!player.brain)
                    return;
                player.kill();
                (_a = _this.generationsStat[player.brain.generation]) === null || _a === void 0 ? void 0 : _a.decrease();
            });
            _this.sets[generation].splice(index, 1);
        };
        this.clearSets = function () {
            _this.sets = [];
            _this.generationsStat = [];
        };
        this.loadLeader = function () {
            var json = localStorage.getItem(LOCAL_STORAGE_LEADER);
            var leader = Intelligence_1.Intelligence.deserialize(json);
            if (leader) {
                _this.clearSets();
                _this.population = 1;
                var set = _this.createSet(leader, false);
                _this.sets[leader.generation] = [set];
                var generationNumber = (leader === null || leader === void 0 ? void 0 : leader.generation) || 0;
                var generation = _this.createGeneration(generationNumber);
                generation.count = 1;
                generation.lastSiblingIndex = leader.siblingIndex || 0;
                _this.watchIndividual = {
                    set: set,
                    player: _this.leftController === 'ai' ? set.players[0] : set.players[1],
                };
                _this.watchGeneration = leader.generation;
            }
        };
        this.saveLeader = function () {
            var _a;
            var brain = (_a = _this.leader) === null || _a === void 0 ? void 0 : _a.player.brain;
            if (brain) {
                var value = brain.serialize();
                localStorage.setItem(LOCAL_STORAGE_LEADER, value);
                localStorage.setItem("".concat(LOCAL_STORAGE_LEADER, "#").concat(brain.generation, ".").concat(brain.siblingIndex), value);
            }
        };
        this.restart = function () {
            _this.sets.map(function (generation) {
                generation.forEach(function (set) {
                    set.players.map(function (player) { return player.reset(); });
                    set.ball.respawn(true);
                });
            });
        };
        this.watchLeaderToggle = function () {
            var _a, _b;
            if (_this.watchIndividual) {
                _this.watchIndividual = undefined;
            }
            else if ((_a = _this.leader) === null || _a === void 0 ? void 0 : _a.player.brain) {
                _this.watchIndividual = _this.leader;
                _this.watchGeneration = (_b = _this.leader.player.brain) === null || _b === void 0 ? void 0 : _b.generation;
            }
        };
        this.unsubscriber = (0, config_1.subscribe)(function (config) {
            _this.config = config;
        });
    }
    return EngineClass;
}());
exports.EngineClass = EngineClass;
