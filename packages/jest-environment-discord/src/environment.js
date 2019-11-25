import crypto from 'crypto';
import startTestBot from 'jest-discord';
import NodeEnvironment from 'jest-environment-node';

export default class DiscordEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    const testEnvironmentOptions = config.testEnvironmentOptions || {};
    this.testGuildId = testEnvironmentOptions.testGuildId;
  }

  async setup() {
    await super.setup();

    try {
      this.testBot = startTestBot({
        token: process.env.TEST_BOT_TOKEN,
        guildId: this.testGuildId,
      });

      const readyWait = new Promise(resolve => {
        this.testBot.on('ready', () => resolve());
      });
      this.testBot.login();
      await readyWait;

      let attempts = 0;

      do {
        this.testChannelName = crypto.randomBytes(8).toString('hex');
        attempts += 1;

        if (attempts > 3) {
          throw new Error('Could not create a unique channel to test in');
        }
      } while (
        this.testBot.channels.some(
          channel => channel.name === this.testChannelName
        )
      );

      this.testChannel = await this.testBot.createTestChannel(
        this.testChannelName
      );

      this.global.testBot = this.testBot;
      this.global.prompt = msg => this.testBot.prompt(this.testChannel, msg);
    } catch (error) {
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
