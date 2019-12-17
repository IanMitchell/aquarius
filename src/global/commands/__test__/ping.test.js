import { getMatchers, getHandlers } from '@aquarius/testing';
import command from '../ping';

describe('Triggers', () => {
  let regex = null;

  beforeAll(() => {
    // eslint-disable-next-line prefer-destructuring
    regex = getMatchers(command)[0];
  });

  test('Does not trigger when message is not Ping', () => {
    expect(regex.test('Test Ping')).toBe(false);
    expect(regex.test('Ping Test')).toBe(false);
  });

  test('Matches Standalone Ping', () => {
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
