"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserFixture = undefined;
exports.getUserFixture = getUserFixture;

var _discord = require("discord.js");

class UserFixture extends _discord.User {}

exports.UserFixture = UserFixture;

function getUserFixture(client, data) {
  return new UserFixture(client, data);
}