"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _jestDiscord = require("jest-discord");

var _jestDiscord2 = _interopRequireDefault(_jestDiscord);

var _jestEnvironmentNode = require("jest-environment-node");

var _jestEnvironmentNode2 = _interopRequireDefault(_jestEnvironmentNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DiscordEnvironment extends _jestEnvironmentNode2.default {
  constructor(config) {
    super(config);
    const testEnvironmentOptions = config.testEnvironmentOptions || {};
    this.testGuildId = testEnvironmentOptions.testGuildId;
  }

  async setup() {
    await super.setup();

    try {
      this.testBot = (0, _jestDiscord2.default)({
        token: process.env.TEST_BOT_TOKEN,
        guildId: this.testGuildId
      });
      const readyWait = new Promise(resolve => {
        this.testBot.on('ready', () => resolve());
      });
      this.testBot.login();
      await readyWait;
      let attempts = 0;

      do {
        this.testChannelName = _crypto2.default.randomBytes(8).toString('hex');
        attempts += 1;

        if (attempts > 3) {
          throw new Error('Could not create a unique channel to test in');
        }
      } while (this.testBot.channels.some(channel => channel.name === this.testChannelName));

      this.testChannel = await this.testBot.createTestChannel(this.testChannelName);
      this.global.testBot = this.testBot;

      this.global.prompt = msg => this.testBot.prompt(this.testChannel, msg);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exit(1);
    }
  }

  async teardown() {
    await super.teardown();
    this.testBot.deleteTestChannel(this.testChannel);
    this.testBot.destroy();
  }

}

exports.default = DiscordEnvironment;
module.exports = exports.default;