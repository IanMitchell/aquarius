import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';

export default function toBeMessage(received, expected) {
  const pass = received.cleanContent === expected;

  const message = () =>
    `${matcherHint('.toBeMessage', undefined, undefined, {
      isNot: this.isNot,
    })}\n\n` +
    `Expected: ${printExpected(expected)}\n` +
    `Received: ${printReceived(received.cleanContent)}`;

  return {
    pass,
    message,
  };
}
