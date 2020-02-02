"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toBeEmbed;

var _jestMatcherUtils = require("jest-matcher-utils");

var _discord = require("discord.js");

function toBeEmbed(received) {
  const pass = received instanceof _discord.RichEmbed;

  const message = () => `${(0, _jestMatcherUtils.matcherHint)('.toBeEmbed', undefined, '', {
    isNot: this.isNot
  })}\n\nReceived: ${(0, _jestMatcherUtils.printReceived)(received.constructor.name)}`;

  return {
    pass,
    message
  };
}

module.exports = exports.default;