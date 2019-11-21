import GuildSettings, { MUTE_DURATION } from '../guild-settings.js';

test.todo('MUTE_DURATION is a duration');

describe('Mute', () => {
  test.todo('Tracks if the bot is muted in a guid');

  test.todo('Automatically unmutes after correct duration');

  test.todo('On boot, auto-mutes for guilds that have not completed a mute');

  test.todo('Can manually unmute');
});

describe('Commands', () => {
  test.todo('Initializes with default commands');

  test.todo('Stores a config for each enabled command');

  test.todo('Disables all commands on mute');

  test.todo('Can check for enabled command');

  test.todo('Can enable command');

  test.todo('Can disable command');

  test.todo('Can get settings for command');

  test.todo('Can set settings for command');

  test.todo('Can remove settings for command');
});

describe('Ignored Users', () => {
  test.todo('Can add users to ignore list');

  test.todo('Can remove users from ignore list');

  test.todo('Indicates if user is ignored');
});

describe('Serialization', () => {
  test.todo('Serializes and saves guild settings');

  test.todo('Deserializes and loads guild settings');
});
