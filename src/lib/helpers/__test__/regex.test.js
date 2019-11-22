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
};

function getAllMessagesBut(message) {
  return Object.values(MESSAGES).filter(msg => msg !== message);
}

describe('MENTION', () => {
  test.each([
    ['Animated Emoji', MESSAGES.animatedEmoji, '588234282468769814'],
    ['Custom Emoji', MESSAGES.customEmoji, '340934564807573505'],
    ['Role', MESSAGES.mentionRole, '481159087929688076'],
    ['Channel', MESSAGES.mentionChannel, '356522910569201665'],
    ['User Nickname', MESSAGES.mentionUserNickname, '356528540742582282'],
    ['User ID', MESSAGES.mentionUserId, '356528540742582282'],
    ['User', MESSAGES.mentionUser, '103635479097769984'],
  ])('Captures ID for %s', (title, message, id) => {
    const match = message.match(MENTION);
    expect(match.groups.id).toBe(id);
  });
});

describe('MENTION_USER', () => {
  test('Captures ID', () => {
    const match = MESSAGES.mentionUser.match(MENTION_USER);
    expect(match.groups).toEqual({
      id: '103635479097769984',
    });
  });

  test('Matches User', () => {
    getAllMessagesBut(MESSAGES.mentionUser).forEach(message => {
      const match = message.match(MENTION_USER);
      expect(match).toBeNull();
    });
  });
});

describe('MENTION_USER_ID', () => {
  test('Captures ID', () => {
    const match = MESSAGES.mentionUserId.match(MENTION_USER_ID);
    expect(match.groups).toEqual({
      id: '356528540742582282',
    });
  });

  test('Only Matches User ID', () => {
    getAllMessagesBut(MESSAGES.mentionUserId).forEach(message => {
      const match = message.match(MENTION_USER_ID);
      expect(match).toBeNull();
    });
  });
});

describe('MENTION_USER_NICKNAME', () => {
  test('Captures ID', () => {
    const match = MESSAGES.mentionUserNickname.match(MENTION_USER_NICKNAME);
    expect(match.groups).toEqual({
      id: '356528540742582282',
    });
  });

  test('Only Matches User Nickname', () => {
    getAllMessagesBut(MESSAGES.mentionUserNickname).forEach(message => {
      const match = message.match(MENTION_USER_NICKNAME);
      expect(match).toBeNull();
    });
  });
});

describe('MENTION_CHANNEL', () => {
  test('Captures ID', () => {
    const match = MESSAGES.mentionChannel.match(MENTION_CHANNEL);
    expect(match.groups).toEqual({
      id: '356522910569201665',
    });
  });

  test('Only Matches Channel', () => {
    getAllMessagesBut(MESSAGES.mentionChannel).forEach(message => {
      const match = message.match(MENTION_CHANNEL);
      expect(match).toBeNull();
    });
  });
});

describe('MENTION_ROLE', () => {
  test('Captures ID', () => {
    const match = MESSAGES.mentionRole.match(MENTION_ROLE);
    expect(match.groups).toEqual({
      id: '481159087929688076',
    });
  });

  test('Only Matches Role', () => {
    getAllMessagesBut(MESSAGES.mentionRole).forEach(message => {
      const match = message.match(MENTION_ROLE);
      expect(match).toBeNull();
    });
  });
});

describe('EMOJI', () => {
  test.todo('Captures Name and ID');

  test.todo('Only Matches Emoji');
});

describe('CUSTOM_EMOJI', () => {
  test('Captures Name and ID', () => {
    const match = MESSAGES.customEmoji.match(CUSTOM_EMOJI);
    expect(match.groups).toEqual({
      id: '340934564807573505',
      name: 'fbslightsmile',
    });
  });

  test('Only Matches Custom Emoji', () => {
    getAllMessagesBut(MESSAGES.customEmoji).forEach(message => {
      const match = message.match(CUSTOM_EMOJI);
      expect(match).toBeNull();
    });
  });
});

describe('ANIMATED_EMOJI', () => {
  test('Captures Name and ID', () => {
    const match = MESSAGES.animatedEmoji.match(ANIMATED_EMOJI);
    expect(match.groups).toEqual({
      id: '588234282468769814',
      name: 'eyesshaking',
    });
  });

  test('Only Matches Animated Emoji', () => {
    getAllMessagesBut(MESSAGES.animatedEmoji).forEach(message => {
      const match = message.match(ANIMATED_EMOJI);
      expect(match).toBeNull();
    });
  });
});

describe('BRACKET', () => {
  test('Captures Name', () => {
    const match = MESSAGES.bracket.match(BRACKET);
    expect(match.groups.name).toBe('Jace Beleren');
  });
});
