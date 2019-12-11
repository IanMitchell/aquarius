import {
  MENTION,
  MENTION_USER,
  MENTION_USER_ID,
  MENTION_USER_NICKNAME,
  MENTION_CHANNEL,
  MENTION_ROLE,
  // EMOJI,
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

function getAllMessagesExcept(...messages) {
  return Object.values(MESSAGES).filter(msg => !messages.includes(msg));
}

describe('MENTION', () => {
  test.each([
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
    getAllMessagesExcept(
      MESSAGES.mentionUser,
      MESSAGES.mentionUserId,
      MESSAGES.mentionUserNickname
    ).forEach(message => {
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
    getAllMessagesExcept(MESSAGES.mentionUserId, MESSAGES.mentionUser).forEach(
      message => {
        const match = message.match(MENTION_USER_ID);
        expect(match).toBeNull();
      }
    );
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
    getAllMessagesExcept(MESSAGES.mentionUserNickname).forEach(message => {
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
    getAllMessagesExcept(MESSAGES.mentionChannel).forEach(message => {
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
    getAllMessagesExcept(MESSAGES.mentionRole).forEach(message => {
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
    getAllMessagesExcept(MESSAGES.customEmoji).forEach(message => {
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
    getAllMessagesExcept(MESSAGES.animatedEmoji).forEach(message => {
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
