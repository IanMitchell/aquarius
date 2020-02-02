"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toHaveEmbed;

var _jestMatcherUtils = require("jest-matcher-utils");

function toHaveEmbed(received) {
  const pass = received.embeds.length > 0;

  const message = () => (0, _jestMatcherUtils.matcherHint)('.toHaveEmbed', undefined, undefined, {
    isNot: this.isNot
  });

  return {
    pass,
    message
  };
}

module.exports = exports.default;