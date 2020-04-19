// import {
//   botString,
//   botMention,
//   botMentionTrigger,
//   dotTrigger,
//   exclamationTrigger,
//   customTrigger,
//   bracketTrigger,
//   messageTriggered,
// } from '../triggers';

// jest.mock('../../../aquarius.js', () => ({}));

describe('botString', () => {
  test.todo('Returns the client user string');
});

describe('botMention', () => {
  test.todo('Constructs a Discord-mention regex');
});

describe('botMentionTrigger', () => {
  test.todo('Checks for a bot mention at the beginning of the message');
});

describe('dotTrigger', () => {
  test.todo('Checks for a period at the beginning of the message');
});

describe('exclamationTrigger', () => {
  test.todo('Checks for an exclamation mark at the beginning of the message');
});

describe('customTrigger', () => {
  test.todo('Ignores bot messages');

  test.todo('Matches the message with a custom regex');
  // mimi <3
});

describe('bracketTrigger', () => {
  test.todo('Ignores bot messages');

  test.todo('Checks for double-bracket strings');

  test.todo('Returns list of all double bracketed names');

  test.todo('Nested brackets do not break');
});

describe('messageTriggered', () => {
  test.todo('Ignores bot messages');

  test.todo('Responds to a bot mention');

  test.todo('Responds to a dot trigger');

  test.todo('Responds to an exclamation mark trigger');
});
