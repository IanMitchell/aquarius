import {
  getMockMessage,
  getMockGroupDMChannel,
  getMockDMChannel,
} from '@aquarius/discordjs-testing';
import { isDirectMessage, isBot, getLink } from '../messages';

describe('isDirectMessage', () => {
  test('Only matches DM Channels', () => {
    expect(isDirectMessage(getMockMessage())).toBe(false);
    expect(isDirectMessage(getMockMessage(getMockGroupDMChannel()))).toBe(
      false
    );
    expect(isDirectMessage(getMockMessage(getMockDMChannel()))).toBe(true);
  });
});

describe('isBot', () => {
  test('Identifies bots', () => {
    expect(isBot({ bot: true })).toBe(true);
    expect(isBot({ bot: false })).toBe(false);
  });
});

describe('getLink', () => {
  test('Generates a link to a message', () => {
    expect(getLink({ guild: { id: 1 }, channel: { id: 2 }, id: 3 })).toBe(
      'https://discordapp.com/channels/1/2/3'
    );
  });
});
