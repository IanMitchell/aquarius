import { isBot } from './users';

describe('isBot', () => {
  test('Identifies bots', () => {
    expect(isBot({ bot: true })).toBe(true);
    expect(isBot({ bot: false })).toBe(false);
  });
});
