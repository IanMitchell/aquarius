import {
  getClientMock,
  getGuildMemberMock,
  getGuildMock,
  getUserMock,
} from 'jest-discord-bot';
import { isGuildAdmin } from './permissions';

test('test mocks', () => {
  const client = getClientMock();
  const guild = getGuildMock(client);
  const user = getUserMock(client);
  getGuildMemberMock(client, guild, user);
  expect(isGuildAdmin(guild, user)).toBe(false);
});

// describe('isGuildAdmin', () => {
//   test('Handles users who are not in the guild', () => {
//     const client = getClientMock();
//     const guild = getGuildMock(client);
//     const user = getUserMock(client);

//     expect(isGuildAdmin(guild, user)).toBe(false);
//   });

//   test('Handles bot owner override', () => {
//     expect(isGuildAdmin(guild, { id: 123 })).toBe(true);
//   });

//   test('Checks the Administrator permission flag', () => {
//     const member = {
//       id: 1,
//       hasPermission: jest.fn().mockReturnValue(false),
//     };

//     expect(isGuildAdmin(guild, member)).toBe(false);
//     expect(member.hasPermission).toHaveBeenCalledWith(
//       Permissions.FLAGS.ADMINISTRATOR
//     );

//     member.hasPermission.mockReturnValueOnce(true);
//     expect(isGuildAdmin(guild, member)).toBe(true);
//   });
// });
