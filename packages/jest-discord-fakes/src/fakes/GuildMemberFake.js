import { GuildMember } from 'discord.js';

export class GuildMemberFake extends GuildMember {
  constructor(guild, data = {}) {
    super(guild, data);
  }
}

/**
 * Generates a standalone GuildMember
 * @param {import('./UserFake').UserFake} user - Faked User
 */
export function getGuildMemberFake(client, guild, user) {
  return new GuildMemberFake(client, { user, guild });
}
