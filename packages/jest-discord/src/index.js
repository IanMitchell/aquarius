import TestBot from './test-bot';

export default function startTestBot({ token, guildId }) {
  return new TestBot(token, guildId);
}
