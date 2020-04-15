import { GuildMember } from 'discord.js';

export class GuildMemberMock extends GuildMember {
  constructor(guild, data = {}) {
    super(guild, data);
  }
}

/**
 * Generates a standalone GuildMember
 * @param {import('./UserMock').UserMock} user - Mocked User
 */
export function getGuildMemberMock(client, guild, user) {
  return new GuildMemberMock(client, { user, guild });
}
