import { matcherHint } from 'jest-matcher-utils';

export default function toHaveEmbed(received) {
  const pass = received.embeds.length > 0;

  const message = () =>
    matcherHint('.toHaveEmbed', undefined, undefined, {
      isNot: this.isNot,
    });

  return {
    pass,
    message,
  };
}
