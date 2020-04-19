import { User } from 'discord.js';

export class UserFake extends User {
  constructor(guild, data = {}) {
    super(guild, data);
  }
}

export function getUserFake(
  client,
  data = {
    id: Math.round(Math.random() * 100),
    username: 'Fake',
    discriminator: Math.round(Math.random() * 1000),
    avatar: null,
    bot: false,
  }
) {
  return new UserFake(client, data);
}
