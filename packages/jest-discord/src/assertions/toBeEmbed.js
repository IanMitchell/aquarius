import { MessageEmbed } from 'discord.js';
import { matcherHint, printReceived } from 'jest-matcher-utils';

export default function toBeEmbed(received) {
  const pass = received instanceof MessageEmbed;

  const message = () =>
    `${matcherHint('.toBeEmbed', undefined, '', {
      isNot: this.isNot,
    })}\n\nReceived: ${printReceived(received.constructor.name)}`;

  return {
    pass,
    message,
  };
}
