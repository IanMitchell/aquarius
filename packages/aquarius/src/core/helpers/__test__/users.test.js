// import { getMockGuild } from '@aquarius-bot/testing';
// import {
//   getOwnedGuilds,
//   getBotOwner,
//   getNickname,
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
