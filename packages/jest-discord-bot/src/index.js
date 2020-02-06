import TestBot from './bot';

export default function startTestBot({ token, guildId }) {
  return new TestBot(token, guildId);
}
