"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require("discord.js");

var _discord2 = _interopRequireDefault(_discord);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULTS = {
  TIMEOUT: 5
};

class TestBot extends _discord2.default.Client {
  constructor(token, testGuildId, defaultTimeout = DEFAULTS.TIMEOUT) {
    super();
    this.token = token;
    this.testGuildId = testGuildId;
    this.defaultTimeout = defaultTimeout;
    this.on('ready', () => {
      this.testGuild = this.guilds.get(testGuildId);
    });
  }

  login() {
    super.login(this.token).catch(err => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
  }

  prompt(channel, message, timeout = this.defaultTimeout) {
    return new Promise(resolve => {
      channel.send(message).then(() => {
        channel.awaitMessages(msg => msg, {
          max: 1,
          time: timeout * 1000,
          errors: ['time']
        }).then(msgs => resolve(msgs.first()));
      });
    });
  }

  createTestChannel(name) {
    return this.testGuild.createChannel(name);
  }

  deleteTestChannel(channel) {
    return this.testGuild.channels.get(channel.id).delete();
  }

}

exports.default = TestBot;
module.exports = exports.default;