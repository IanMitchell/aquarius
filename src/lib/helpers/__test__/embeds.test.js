import { guildEmbed } from '../embeds';

const guildMock = {
  createdAt: Date.now(),
  members: [],
  channels: {
    array: () => [],
  },
  iconUrl: '',
  name: 'Test',
  owner: {
    displayName: 'Ian',
  },
  memberCount: 1,
  id: 1,
};

describe('guildEmbed', () => {
  test('Embed Test', async () => {
    expect(await guildEmbed(guildMock)).toBeEmbed();
  });

  test.todo('Creates base embed');

  test.todo('Allows extra additional fields');
});
