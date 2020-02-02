"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMockTextChannel = getMockTextChannel;
exports.getMockGroupDMChannel = getMockGroupDMChannel;
exports.getMockDMChannel = getMockDMChannel;
exports.getMockMessage = getMockMessage;
exports.getMockUser = getMockUser;
exports.getMockGuild = getMockGuild;

var _discord = require("discord.js");

var _client = require("./client");

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMockTextChannel(client = new _client2.default(), data) {
  return new _discord.TextChannel(client, data);
}

function getMockGroupDMChannel(client = new _client2.default(), data) {
  return new _discord.GroupDMChannel(client, data);
}

function getMockDMChannel(client = new _client2.default(), data) {
  return new _discord.DMChannel(client, data);
}

function getMockMessage(channel = getMockTextChannel(), data = null, client = new _client2.default()) {
  return new _discord.Message(channel, data, client);
}

function getMockUser(client = new _client2.default(), data) {
  return new _discord.User(client, data);
}

function getMockGuild(client = new _client2.default(), data) {
  return new _discord.Guild(client, data); // const user = getMockUser();
  // // const member = new GuildMember(guild, {
  // //   user,
  // //   roles: ['test'],
  // // });
  // guild._addMember(user, false);
}