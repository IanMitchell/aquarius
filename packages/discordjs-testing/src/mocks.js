import { Message, TextChannel, GroupDMChannel, DMChannel } from 'discord.js';
import MockClient from './client';

export function getMockTextChannel(client = new MockClient(), data) {
  return new TextChannel(client, data);
}

export function getMockGroupDMChannel(client = new MockClient(), data) {
  return new GroupDMChannel(client, data);
}

export function getMockDMChannel(client = new MockClient(), data) {
  return new DMChannel(client, data);
}

export function getMockMessage(
  channel = getMockTextChannel(),
  data = null,
  client = new MockClient()
) {
  return new Message(channel, data, client);
}
