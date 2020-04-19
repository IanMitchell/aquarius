import { ClientFake, getClientFake } from './fakes/ClientFake';
import { getGuildFake, GuildFake } from './fakes/GuildFake';
import { getGuildMemberFake, GuildMemberFake } from './fakes/GuildMemberFake';
import { getUserFake, UserFake } from './fakes/UserFake';

export function createFakeGuild() {
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
  ClientFake,
  getClientFake,
  UserFake,
  getUserFake,
  GuildMemberFake,
  getGuildMemberFake,
  GuildFake,
  getGuildFake,
};
