// import { getMockGuild } from '@aquarius/testing';
// import {
//   getOwnedGuilds,
//   getBotOwner,
//   getNickname,
//   hasRole,
// } from '../users';

jest.mock('../../../aquarius.js', () => ({}));

describe('getOwnedGuilds', () => {
  test.todo('Finds guilds owned by user');
});

describe('getBotOwner', () => {
  test.todo('Finds the bot owner user');
});

describe('getNickname', () => {
  test.todo('Works for a GuildMember or a User object');

  test.todo('Uses username if no nickname is set');
});

describe('hasRole', () => {
  test.todo('Indicates if member has role or not');

  test.todo('Handles users that are not guild members');
});
