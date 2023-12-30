'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.PlayerClass = void 0
var config_1 = require('./config')
var paddleWidth = config_1.config.paddleWidth,
  paddleHeight = config_1.config.paddleHeight,
  boardWidth = config_1.config.boardWidth
var PlayerClass = /** @class */ (function () {
  function PlayerClass(side, y) {
    if (y === void 0) {
      y = 0
    }
    var _this = this
    this.updatePosition = function (delta) {
      _this.yTop = _this.yTop + delta
      _this.yBottom = _this.yTop + paddleHeight
      _this.callback()
    }
    this.side = side
    this.xEdge = side === 'left' ? paddleWidth : boardWidth - paddleWidth
    this.yTop = y
    this.yBottom = this.yTop + paddleHeight
    this.callback = function () {}
  }
  PlayerClass.prototype.render = function (callback) {
    this.callback = callback
  }
  return PlayerClass
})()
exports.PlayerClass = PlayerClass
