"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerClass = void 0;
var config_1 = require("./config");
var _a = (0, config_1.getConfig)(), paddleWidth = _a.paddleWidth, paddleHeight = _a.paddleHeight, boardWidth = _a.boardWidth, boardHeight = _a.boardHeight, playerSpeed = _a.playerSpeed, boardPadding = _a.boardPadding;
var PlayerClass = /** @class */ (function () {
    function PlayerClass(_a) {
        var side = _a.side, _b = _a.height, height = _b === void 0 ? paddleHeight : _b, _c = _a.controller, controller = _c === void 0 ? 'keys' : _c, brain = _a.brain;
        var _this = this;
        this.score = 0;
        this.stimulation = 0;
        this.height = paddleHeight;
        this.updatePosition = function (direction) {
            if (direction === 0)
                return;
            _this.stimulate('move');
            if ((_this.yTop <= 0 && direction < 0) || (_this.yBottom >= boardHeight && direction > 0))
                return;
            _this.yTop = Math.max(0, Math.min(boardHeight - _this.height, _this.yTop + direction * playerSpeed));
            _this.yBottom = _this.yTop + _this.height;
        };
        this.stimulate = function (type) {
            if (_this.controller !== 'ai')
                return;
            var config = (0, config_1.getConfig)();
            _this.stimulation = _this.stimulation + config["".concat(type, "Stimulation")];
        };
        this.addScore = function () {
            _this.score = _this.score + 1;
        };
        this.reset = function () {
            _this.score = 0;
            _this.stimulation = 0;
            _this.yTop = boardHeight / 2 - _this.height / 2;
            _this.yBottom = _this.yTop + _this.height;
        };
        this.side = side;
        this.xEdge =
            side === 'left' ? paddleWidth + boardPadding : boardWidth - paddleWidth - boardPadding;
        this.xFail = side === 'left' ? this.xEdge - paddleWidth : this.xEdge + paddleWidth;
        this.height = controller === 'wall' ? boardHeight : height;
        this.yTop = boardHeight / 2 - this.height / 2;
        this.yBottom = this.yTop + this.height;
        this.controller = controller;
        this.brain = brain;
    }
    return PlayerClass;
}());
exports.PlayerClass = PlayerClass;
