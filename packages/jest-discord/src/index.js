import { ClientMock, getClientMock } from './mocks/ClientMock';
import { getGuildMemberMock, GuildMemberMock } from './mocks/GuildMemberMock';
import { getGuildMock, GuildMock } from './mocks/GuildMock';
import { getUserMock, UserMock } from './mocks/UserMock';

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
