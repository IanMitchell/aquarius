import { Guild } from 'discord.js';

export class GuildFake extends Guild {}

export function getGuildFake(client) {
  return new GuildFake(client);
}
