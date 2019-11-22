import { Permissions } from 'discord.js';
import {
  isBotOwner,
  isGuildAdmin,
  // isUserIgnored,
  // getPermissionName,
  // check,
  // getRequestMessage,
} from '../permissions';

jest.mock('../../../aquarius.js', () => ({
  config: {
    owner: 123,
  },
  guildManager: {
    get: () => ({
      isUserIgnored: () => jest.fn(),
    }),
  },
}));

const guild = {
  member: jest.fn().mockImplementation(user => user),
  me: {
    hasPermission: jest.fn().mockReturnValue(false),
  },
};

describe('isBotOwner', () => {
  test('Checks against config owner id', () => {
    expect(isBotOwner({ id: 1 })).toBe(false);
    expect(isBotOwner({ id: 123 })).toBe(true);
  });
});

describe('isGuildAdmin', () => {
  test('Handles users who are not in the guild', () => {
    guild.member.mockReturnValueOnce(null);

    expect(isGuildAdmin(guild, { id: 123 })).toBe(false);
  });

  test('Handles bot owner override', () => {
    expect(isGuildAdmin(guild, { id: 123 })).toBe(true);
  });

  test('Checks the Administrator permission flag', () => {
    const member = {
      id: 1,
      hasPermission: jest.fn().mockReturnValue(false),
    };

    expect(isGuildAdmin(guild, member)).toBe(false);
    expect(member.hasPermission).toHaveBeenCalledWith(
      Permissions.FLAGS.ADMINISTRATOR
    );

    member.hasPermission.mockReturnValueOnce(true);
    expect(isGuildAdmin(guild, member)).toBe(true);
  });
});

describe('isUserIgnored', () => {
  test.todo('Cannot ignore guild admins');

  test.todo('Checks guild settings for correct guild');
});

describe('getPermissionName', () => {
  test.todo('Handles unknown permissions');

  test.todo('Matches all permissions');
});

describe('check', () => {
  test.todo('Identifies missing permissions');

  test.todo('Returns missing permissions');
});

describe('getRequestMessage', () => {
  test.todo('Pluralizes permission');

  test.todo('Uses the permission name in the message');
});
