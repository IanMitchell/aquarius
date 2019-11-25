import { matcherHint, printReceived } from 'jest-matcher-utils';
import { RichEmbed } from 'discord.js';

export default function toBeEmbed(received) {
  const pass = received instanceof RichEmbed;

  const message = () =>
    `${matcherHint('.toBeEmbed', undefined, undefined, {
      isNot: this.isNot,
    })}\n\n` +
    `Expected: RichEmbed\n` +
    `Received: ${printReceived(typeof received)}`;

  return {
    pass,
    message,
  };
}
