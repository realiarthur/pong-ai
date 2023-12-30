"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerClass = void 0;
var Intelligence_1 = require("./Intelligence");
var config_1 = require("./config");
var paddleWidth = config_1.config.paddleWidth, paddleHeight = config_1.config.paddleHeight, boardWidth = config_1.config.boardWidth, boardHeight = config_1.config.boardHeight, playerSpeed = config_1.config.playerSpeed, boardPadding = config_1.config.boardPadding;
var PlayerClass = /** @class */ (function () {
    function PlayerClass(_a) {
        var side = _a.side, _b = _a.y, y = _b === void 0 ? boardHeight / 2 - paddleHeight / 2 : _b, _c = _a.controller, controller = _c === void 0 ? 'keyboard' : _c, dna = _a.dna;
        var _this = this;
        this.stimulation = 0;
        this.updatePosition = function (direction) {
            if (direction === 0)
                return;
            if ((_this.yTop <= 0 && direction < 0) || (_this.yBottom >= boardHeight && direction > 0)) {
                return;
            }
            _this.stimulate(1);
            _this.yTop = _this.yTop + direction * playerSpeed;
            _this.yBottom = _this.yTop + paddleHeight;
        };
        this.stimulate = function (x) {
            _this.stimulation = _this.stimulation + x;
        };
        this.side = side;
        this.xEdge =
            side === 'left' ? paddleWidth + boardPadding : boardWidth - paddleWidth - boardPadding;
        this.xFail = side === 'left' ? this.xEdge - paddleWidth : this.xEdge + paddleWidth;
        this.yTop = y;
        this.yBottom = this.yTop + paddleHeight;
        this.controller = controller;
        if (controller === 'ai') {
            this.brain = new Intelligence_1.Intelligence(dna);
        }
    }
    return PlayerClass;
}());
exports.PlayerClass = PlayerClass;
