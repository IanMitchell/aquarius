import { getHandlers, getMatchers } from '@aquarius/testing';
import command from '../ping';

describe('Triggers', () => {
  let regex = null;

  beforeAll(() => {
    // eslint-disable-next-line prefer-destructuring
    regex = getMatchers(command)[0];
  });

  test('Matches Standalone Ping', () => {
    expect(regex.test('ping')).toBe(true);
  });

  test('Does not match a `pin` trigger', () => {
    expect(regex.test('pin')).toBe(false);
  });

  test('Does not match if in phrase', () => {
    expect(regex.test('Test Ping')).toBe(false);
    expect(regex.test('Test Ping Test')).toBe(false);
  });

  test('Match is case insensitive', () => {
    expect(regex.test('PING')).toBe(true);
    expect(regex.test('ping')).toBe(true);
  });
});

test('Responds with Pong', () => {
  const analytics = { trackUsage: jest.fn() };
  const handler = getHandlers(command, { analytics })[0];

  const message = {
    channel: {
      send: jest.fn(),
    },
  };
  handler(message);
  expect(message.channel.send).toHaveBeenCalledWith('pong');
});
