import { getUserMock } from 'jest-discord-bot';
import { isBot } from './users';

describe('isBot', () => {
  test('Identifies bots', () => {
    const user = getUserMock();
    expect(isBot(user)).toBe(false);

    user.bot = true;
    expect(isBot(user)).toBe(true);
  });
});
