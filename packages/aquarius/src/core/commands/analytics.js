import trackEvent, {
  getInteractionContext,
  getMessageContext,
} from '../analytics/track';

/**
 * Used to create and store analytic events in Commands and Plugins
 */
export default class Analytics {
  /**
   * Creates a new Analytic wrapper
   * @param {string} name - Name of the command
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Tracks an analytic event
   * @param {string} label - ?
   * @param {string} action - ?
   * @param {Object} context - Additional data to associate with the analytic event
   */
  track(label, action, context) {
    trackEvent(this.name, label, action, context);
  }

  /**
   * Creates an analytic event for a command usage
   * @param {string} action - Command invocation that was triggered
   * @param {import('discord.js').Message} message - Message that triggered the command
   * @param {Object} context - Additional data to associate with the analytic event
   */
  trackUsage(action, message, context = {}) {
    const ctx = getMessageContext(message);

    this.track('usage', action, {
      ...ctx,
      ...context,
    });
  }

  // TODO: Make this not nasty
  // lol action / interaction
  trackInteraction(action, interaction, context = {}) {
    const ctx = getInteractionContext(interaction);

    this.track('interaction', action, {
      ...ctx,
      ...context,
    });
  }
}
