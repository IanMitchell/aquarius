import { matcherHint, printReceived } from 'jest-matcher-utils';
import { RichEmbed } from 'discord.js';

export default function toBeEmbed(received) {
  const pass = received instanceof RichEmbed;

  const message = () =>
    `${matcherHint('.toBeEmbed', undefined, '', {
      isNot: this.isNot,
    })}\n\nReceived: ${printReceived(received.constructor.name)}`;

  return {
    pass,
    message,
  };
}
