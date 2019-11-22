import aquarius from '../../aquarius';

/** @typedef {import('../../typedefs').CommandInfo} CommandInfo */

/**
 * Command Guild configuration API
 */
export default class Settings {
  /**
   * Creates a new Settings for a given command
   * @param {string} name - The Command name to use
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Registers a new Setting for a command
   * @param {string} key - The name of the setting
   * @param {*} defaultValue - The value to use if no Guild override exists
   * @param {string} description - A description of what the setting does
   */
  register(key, description, defaultValue) {
    aquarius.commandConfigs
      .get(this.name)
      .addSetting(key, description, defaultValue);
  }

  /**
   * Gets the Command setting value for a given Guild
   * @param {string} guildId - The ID of the Guild to lookup
   * @param {string} key - The Setting key to lookup
   */
  get(guildId, key) {
    return aquarius.commandConfigs.get(this.name).get(guildId, key);
  }
}
