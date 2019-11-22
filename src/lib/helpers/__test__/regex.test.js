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
} from '../regex';

const MESSAGES = {
  bracket: 'My favorite MTG card is [[Jace Beleren]] and I am not sorry',
  animatedEmoji: 'This is an <a:eyesshaking:588234282468769814> Animated Emoji',
  customEmoji: 'This is a <:fbslightsmile:340934564807573505> Custom Emoji',
  emoji: '',
  mentionRole: 'Mention <@&481159087929688076> Role',
  mentionChannel: 'Mention <#356522910569201665> Channel',
  mentionUserNickname: 'Mention <@!356528540742582282> User Nickname',
  mentionUserId: 'Mention <@356528540742582282> User ID',
  mentionUser: 'Mention <@103635479097769984> User No Nickname',
  mention: '',
};

function filterMessages(name) {
  return Object.keys(MESSAGES)
    .filter(key => key !== name)
    .map(key => MESSAGES[key]);
}

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
  test('Captures Name and ID', () => {
    const match = MESSAGES.animatedEmoji.match(ANIMATED_EMOJI);
    expect(match).not.toBeNull();
    expect(match.groups).toEqual({
      id: '588234282468769814',
      name: 'eyesshaking',
    });
  });

  test('Only Matches Animated Emoji', () => {
    filterMessages('animatedEmoji').forEach(message => {
      const match = message.match(ANIMATED_EMOJI);
      expect(match).toBeNull();
    });
  });
});

describe('BRACKET', () => {
  test('Captures Name', () => {
    const match = MESSAGES.bracket.match(BRACKET);
    expect(match).not.toBeNull();
    expect(match.groups.name).toBe('Jace Beleren');
  });
});
