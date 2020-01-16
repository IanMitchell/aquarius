import {
  Message,
  TextChannel,
  GroupDMChannel,
  DMChannel,
  User,
  Guild,
  // GuildMember,
} from 'discord.js';
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

export function getMockUser(client = new MockClient(), data) {
  return new User(client, data);
}

export function getMockGuild(client = new MockClient(), data) {
  return new Guild(client, data);
  // const user = getMockUser();
  // // const member = new GuildMember(guild, {
  // //   user,
  // //   roles: ['test'],
  // // });

  // guild._addMember(user, false);
}
