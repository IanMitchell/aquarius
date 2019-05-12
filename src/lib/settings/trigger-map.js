import chalk from 'chalk';
import debug from 'debug';

const log = debug('Trigger Map');

/** @typedef {import('../../typedefs').CommandInfo} CommandInfo */

/**
 * Tracks RegExp listeners registered by Commands
 * @extends Map
 */
export default class TriggerMap extends Map {
  /**
   * Ties the Regex Map to a Command
   * @param {CommandInfo} info - The Current Command Info object
   */
  setCurrentCommand(info) {
    this.currentCommand = info;
  }

  /**
   * Registers a new RegExp the command is listening for
   * @param {RegExp} regex - Regex trigger registered by the Command
   */
  onTrigger(regex) {
    if (this.has(regex.toString())) {
      // TODO: Determine if this can be supported, should kill the bot,
      // or even matters
      log(
        `${chalk.red('WARNING:')} Duplicate Regex detected: ${regex.toString()}`
      );
    }

    this.set(regex.toString(), this.currentCommand);
  }

  /**
   * Registers a new RegExp the command is listening for
   * @param {RegExp} regex - Regex trigger registered by the Command
   */
  onCommand(regex) {
    this.onTrigger(regex);
  }

  // Method Stubs (core Discord.js Client methods)
  on() {}

  // TODO: Figure this one out
  onMessage() {}

  onDynamicTrigger() {}

  onDirectMessage() {}
}
