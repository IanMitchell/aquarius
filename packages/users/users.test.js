import { getUserFake } from 'jest-discord-fakes';
import { isBot } from './users';

describe('isBot', () => {
  test('Identifies bots', () => {
    const user = getUserFake();
    expect(isBot(user)).toBe(false);

    user.bot = true;
    expect(isBot(user)).toBe(true);
  });
});

describe('getNickname', () => {
  test.todo('Handles no guild');

  test.todo('Handles a user object');

  test.todo('Handles a GuildMember object');

  test.todo('Handles a nickname');

  test.todo('Handles no nickname');
});

describe('isStreaming', () => {
  test.todo('Identifies a streaming activity');
});
