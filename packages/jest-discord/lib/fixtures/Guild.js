"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GuildFixture = undefined;
exports.getGuildFixture = getGuildFixture;

var _discord = require("discord.js");

class GuildFixture extends _discord.Guild {
  createRoleFixture(data) {
    return new _discord.Role(this.client, data, this);
  }

  createGuildMemberFixture(data) {
    return new _discord.GuildMember(this.client, data, this);
  }

}

exports.GuildFixture = GuildFixture;

function getGuildFixture(client, data) {
  return new GuildFixture(client, data);
}