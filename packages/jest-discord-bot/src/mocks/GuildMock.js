import { Guild } from 'discord.js';

export class GuildMock extends Guild {}

export function getGuildMock(client) {
  return new GuildMock(client);
}
