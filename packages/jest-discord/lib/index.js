"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startTestBot;

var _testBot = require("./test-bot");

var _testBot2 = _interopRequireDefault(_testBot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startTestBot({
  token,
  guildId
}) {
  return new _testBot2.default(token, guildId);
}

module.exports = exports.default;