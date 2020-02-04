import {
  getMockDMChannel,
  getMockGroupDMChannel,
  getMockMessage,
} from '@aquarius/testing';
import { getLink, isDirectMessage } from './messages';

describe('isDirectMessage', () => {
  test('Only matches DM Channels', () => {
    expect(isDirectMessage(getMockMessage())).toBe(false);
    expect(isDirectMessage(getMockMessage(getMockGroupDMChannel()))).toBe(
      false
    );
    expect(isDirectMessage(getMockMessage(getMockDMChannel()))).toBe(true);
  });
});

describe('getLink', () => {
  test('Generates a link to a message', () => {
    expect(getLink({ guild: { id: 1 }, channel: { id: 2 }, id: 3 })).toBe(
      'https://discordapp.com/channels/1/2/3'
    );
  });
});
