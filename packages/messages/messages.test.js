import Discord from 'discord.js';
import { getLink, isDirectMessage } from './messages';

const { TextChannel, GroupDMChannel, DMChannel, Message } = Discord;

describe('isDirectMessage', () => {
  test('Only matches DM Channels', () => {
    expect(isDirectMessage(new Message(new TextChannel()))).toBe(false);
    expect(isDirectMessage(new Message(new GroupDMChannel()))).toBe(false);
    expect(isDirectMessage(new Message(new DMChannel()))).toBe(true);
  });
});

describe('getLink', () => {
  test('Generates a link to a message', () => {
    expect(getLink({ guild: { id: 1 }, channel: { id: 2 }, id: 3 })).toBe(
      'https://discordapp.com/channels/1/2/3'
    );
  });
});
