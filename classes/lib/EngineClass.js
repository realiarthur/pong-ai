"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineClass = void 0;
var BallClass_1 = require("./BallClass");
var GameSet_1 = require("./GameSet");
var Intelligence_1 = require("./Intelligence");
var PlayerClass_1 = require("./PlayerClass");
var config_1 = require("./config");
var LOCAL_STORAGE_LEADER = 'leader';
var EngineClass = /** @class */ (function () {
    function EngineClass() {
        var _this = this;
        this.sets = [];
        this.lookingForLeader = false;
        this.leftController = 'keys';
        this.rightController = 'ai';
        this.setControllers = function (leftController, rightController) {
            if (leftController === void 0) { leftController = 'wall'; }
            if (rightController === void 0) { rightController = 'ai'; }
            _this.leftController = leftController;
            _this.rightController = rightController;
            // if (leftController === 'keys' || leftController === 'mouse') {
            //   this.commonLeftPlayer = new PlayerClass({ side: 'left', controller: this.leftController })
            // }
            // if (rightController === 'keys' || rightController === 'mouse') {
            //   this.commonRightPlayer = new PlayerClass({ side: 'right', controller: this.rightController })
            // }
            _this.loadLeader();
        };
        this.createSets = function (leaderIntelligence, count) {
            if (count === void 0) { count = (0, config_1.getConfig)().population; }
            var leaderCreated = false;
            var createAi = function () {
                if (leaderIntelligence && !leaderCreated) {
                    leaderCreated = true;
                    return leaderIntelligence;
                }
                return leaderIntelligence ? leaderIntelligence.mutate() : new Intelligence_1.Intelligence();
            };
            _this.sets = Array.from({ length: count }, function () {
                var _a, _b;
                var players = [
                    (_a = _this.commonLeftPlayer) !== null && _a !== void 0 ? _a : new PlayerClass_1.PlayerClass({
                        side: 'left',
                        controller: _this.leftController,
                        brain: _this.leftController === 'ai' ? createAi() : undefined,
                    }),
                    (_b = _this.commonRightPlayer) !== null && _b !== void 0 ? _b : new PlayerClass_1.PlayerClass({
                        side: 'right',
                        controller: _this.rightController,
                        brain: _this.rightController === 'ai' ? createAi() : undefined,
                    }),
                ];
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
                return new GameSet_1.GameSet(players, ball);
            });
        };
        this.mutateLeader = function () {
            var _a;
            _this.createSets((_a = _this.leader) === null || _a === void 0 ? void 0 : _a.player.brain);
        };
        this.loadLeader = function () {
            var json = localStorage.getItem(LOCAL_STORAGE_LEADER);
            var leader = Intelligence_1.Intelligence.deserialize(json);
            if (leader) {
                _this.createSets(leader, 1);
            }
        };
        this.saveLeader = function () {
            var _a;
            if ((_a = _this.leader) === null || _a === void 0 ? void 0 : _a.player.brain) {
                localStorage.setItem(LOCAL_STORAGE_LEADER, _this.leader.player.brain.serialize());
            }
        };
        this.restart = function () {
            _this.sets.map(function (set) {
                set.players.map(function (player) { return player.reset(); });
                set.ball.respawn(true);
            });
        };
    }
    EngineClass.prototype.update = function () {
        var _this = this;
        this.leader = {
            index: 0,
            set: this.sets[0],
            player: this.sets[0].players[1],
        };
        this.sets.forEach(function (set, index) {
            set.tick();
            set.players.forEach(function (player) {
                var _a;
                if (player.controller === 'ai' &&
                    player.stimulation > (((_a = _this.leader) === null || _a === void 0 ? void 0 : _a.player.stimulation) || 0)) {
                    _this.leader = {
                        index: index,
                        set: set,
                        player: player,
                    };
                }
            });
        });
    };
    return EngineClass;
}());
exports.EngineClass = EngineClass;
