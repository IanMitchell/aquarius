import {
  botLink,
  getHost,
  getVanityBotLink,
  getGitHubLink,
  getDocsLink,
} from '../links';

jest.mock('../../../aquarius.js', () => ({}));

describe('botLink', () => {
  test.todo('Creates Link');

  test.todo('Includes Client ID');

  test.todo('Includes Permissions');
});

describe('getHost', () => {
  test.todo('Uses localhost in development');

  test.todo('Uses config host');
});

describe('getVanityBotLink', () => {
  test.todo('Creates link');
});

describe('getGitHubLink', () => {
  test.todo('Creates link');
});

describe('getDocsLink', () => {
  test.todo('Creates link');
});
