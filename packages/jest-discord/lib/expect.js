"use strict";

var _toBeEmbed = require("./assertions/toBeEmbed");

var _toBeEmbed2 = _interopRequireDefault(_toBeEmbed);

var _toBeMessage = require("./assertions/toBeMessage");

var _toBeMessage2 = _interopRequireDefault(_toBeMessage);

var _toHaveEmbed = require("./assertions/toHaveEmbed");

var _toHaveEmbed2 = _interopRequireDefault(_toHaveEmbed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

expect.extend({
  toBeEmbed: _toBeEmbed2.default,
  toBeMessage: _toBeMessage2.default,
  toHaveEmbed: _toHaveEmbed2.default
});