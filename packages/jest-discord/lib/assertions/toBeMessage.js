"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toBeMessage;

var _jestMatcherUtils = require("jest-matcher-utils");

function toBeMessage(received, expected) {
  const pass = received.cleanContent === expected;

  const message = () => `${(0, _jestMatcherUtils.matcherHint)('.toBeMessage', undefined, undefined, {
    isNot: this.isNot
  })}\n\n` + `Expected: ${(0, _jestMatcherUtils.printExpected)(expected)}\n` + `Received: ${(0, _jestMatcherUtils.printReceived)(received.cleanContent)}`;

  return {
    pass,
    message
  };
}

module.exports = exports.default;