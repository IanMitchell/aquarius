import trackEvent from '../analytics/track';

// TODO: Document
export default class Analytics {
  constructor(name) {
    this.name = name;
  }

  // TODO: Document
  track(label, action, context) {
    trackEvent(this.name, label, action, context);
  }

  // TODO: Document
  trackUsage(action, message, context = {}) {
    let ctx = {};

    if (message) {
      if (message.guild) {
        ctx.guildId = message.guild.id;
      }

      if (message.channel) {
        ctx.channelId = message.channel.id;
      }

      if (message.author) {
        ctx.userId = message.author.id;
      }

      if (message.content) {
        ctx.content = message.content;
      }
    }

    this.track('usage', action, {
      ...ctx,
      ...context,
    });
  }
}
