import { User } from 'discord.js';

export class UserMock extends User {
  constructor(guild, data = {}) {
    super(guild, data);
  }
}

export function getUserMock(
  client,
  data = {
    id: Math.round(Math.random() * 100),
    username: 'Mock',
    discriminator: Math.round(Math.random() * 1000),
    avatar: null,
    bot: false,
  }
) {
  return new UserMock(client, data);
}
