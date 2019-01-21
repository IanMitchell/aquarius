/**
 * @jest-environment node
 */

import { TextChannel } from 'discord.js';
import * as loading from '../loading';

describe('Discord.js API', () => {
  test('TextChannels have `startTyping`', () => {
    const channel = new TextChannel({}, {});
    expect(typeof channel.startTyping).toBe('function');
  });

  test('TextChannels have `stopTyping`', () => {
    const channel = new TextChannel({}, {});
    expect(typeof channel.stopTyping).toBe('function');
  });
});

describe('Loading', () => {
  const channel = {
    startTyping: jest.fn(),
    stopTyping: jest.fn(),
  };

  beforeEach(() => {
    channel.startTyping.mockClear();
    channel.stopTyping.mockClear();
  });

  test('start calls the correct method', () => {
    loading.start(channel);
    expect(channel.startTyping).toBeCalled();
  });

  test('stop calls the correct method', () => {
    loading.stop(channel);
    expect(channel.stopTyping).toBeCalled();
  });
});
