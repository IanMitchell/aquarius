import { Permissions } from 'discord.js';
import { isGuildAdmin } from './permissions';

const guild = {
  member: jest.fn().mockImplementation(user => user),
  me: {
    hasPermission: jest.fn().mockReturnValue(false),
  },
};

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
