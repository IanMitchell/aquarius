import {
  MENTION,
  MENTION_USER,
  MENTION_USER_ID,
  MENTION_USER_NICKNAME,
  MENTION_CHANNEL,
  MENTION_ROLE,
  EMOJI,
  CUSTOM_EMOJI,
  ANIMATED_EMOJI,
  BRACKET,
} from './matchers.js';

const MESSAGES = {
  bracket: 'My favorite MTG card is [[Jace Beleren]] and I am not sorry',
  animatedEmoji: '',
  customEmoji: '',
  emoji: '',
  mentionRole: '',
  mentionChannel: '',
  mentionUserNickname: '',
  mentionUserId: '',
  mentionUser: '',
  mention: '',
};

describe('MENTION', () => {
  test.todo('Captures ID');

  test.todo('Matches User');

  test.todo('Matches User ID');

  test.todo('Matches User with Nick');

  test.todo('Matches Channel');

  test.todo('Matches Role');
});

describe('MENTION_USER', () => {
  test.todo('Captures ID');

  test.todo('Matches User');
});

describe('MENTION_USER_ID', () => {
  test.todo('Captures ID');

  test.todo('Matches User ID');
});

describe('MENTION_USER_NICK', () => {
  test.todo('Captures ID');

  test.todo('Matches User Nick');
});

describe('MENTION_CHANNEL', () => {
  test.todo('Captures ID');

  test.todo('Matches Channel');
});

describe('MENTION_ROLE', () => {
  test.todo('Captures ID');

  test.todo('Matches Role');
});

describe('EMOJI', () => {
  test.todo('Captures Name and ID');

  test.todo('Matches Emoji');
});

describe('CUSTOM_EMOJI', () => {
  test.todo('Captures Name and ID');

  test.todo('Matches Custom Emoji');
});

describe('ANIMATED_EMOJI', () => {
  test.todo('Captures Name and ID');

  test.todo('Matches Animated Emoji');
});

describe('BRACKET', () => {
  test('Captures Name', () => {
    const match = MESSAGES.bracket.match(BRACKET);
    expect(match).not.toBeNull();
    expect(match.groups.name).toBe('Jace Beleren');
  });
});
