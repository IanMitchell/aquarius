import TestBot from './bot';
import { ClientMock, getClientMock } from './mocks/ClientMock';
import { getGuildMemberMock, GuildMemberMock } from './mocks/GuildMemberMock';
import { getGuildMock, GuildMock } from './mocks/GuildMock';
import { getUserMock, UserMock } from './mocks/UserMock';

export default function startTestBot({ token, guildId }) {
  return new TestBot(token, guildId);
}

export function createMockGuild() {
  return {
    guild: null,
    admins: [],
    addAdmin: () => {},
    moderators: [],
    addModerator: () => {},
    roles: [],
    addRole: () => {},
    textChannels: [],
    addTextChannel: () => {},
    voiceChannels: [],
    addVoiceChannel: () => {},
  };
}

export {
  ClientMock,
  getClientMock,
  UserMock,
  getUserMock,
  GuildMemberMock,
  getGuildMemberMock,
  GuildMock,
  getGuildMock,
};
