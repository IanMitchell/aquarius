/* global prompt */
import { info } from '../info';

describe('Metadata', () => {
  test('exposes an info object', () => {
    expect(info).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        usage: expect.any(String),
      })
    );
  });
});

describe('Embed', () => {
  test('posts an embed', async () => {
    const response = await prompt('.info');
    expect(response).toHaveEmbed();
  });
});
