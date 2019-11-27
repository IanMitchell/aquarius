import {
  botLink,
  getHost,
  getVanityBotLink,
  getGitHubLink,
  getDocsLink,
} from '../links';

jest.mock('../../../aquarius.js', () => ({
  config: {
    url: 'https://aquarius.sh',
  },
}));

describe('botLink', () => {
  test('Creates Link with Permissions', () => {
    expect(botLink()).toMatchInlineSnapshot(
      `"https://discordapp.com/oauth2/authorize?client_id=356528540742582282&scope=bot&permissions=1543892032"`
    );
  });

  test('Includes Client ID', () => {
    expect(botLink()).toContain(process.env.CLIENT_ID);
  });
});

describe('getHost', () => {
  test('Uses localhost in development', () => {
    expect(getHost()).toMatchInlineSnapshot(`"http://localhost:3000"`);
  });

  test('Uses config host in Prod', () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    expect(getHost()).toBe('https://aquarius.sh');

    process.env.NODE_ENV = env;
  });
});

describe('getVanityBotLink', () => {
  test('Creates link', () => {
    expect(getVanityBotLink()).toMatchInlineSnapshot(
      `"http://localhost:3000/link"`
    );
  });
});

describe('getGitHubLink', () => {
  test('Creates link', () => {
    expect(getGitHubLink()).toMatchInlineSnapshot(
      `"http://github.com/ianmitchell/aquarius"`
    );
  });
});

describe('getDocsLink', () => {
  test('Creates link', () => {
    expect(getDocsLink()).toMatchInlineSnapshot(`"http://localhost:3000/docs"`);
  });
});
