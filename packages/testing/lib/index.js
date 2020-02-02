"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mocks = require("./mocks");

Object.keys(_mocks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _mocks[key];
    }
  });
});

var _matchers = require("./matchers");

Object.keys(_matchers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _matchers[key];
    }
  });
});

var _client = require("./client");

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _client2.default;