import aquarius from '../../aquarius';

// TODO: Document
export default class CommandConfig {
  constructor(name) {
    this.name = name;
    this.descriptions = new Map();
    this.defaultSettings = new Map();
  }

  // TODO: Document
  addSetting(key, description, value) {
    this.descriptions.set(key, description);
    this.defaultSettings.set(key, value);
  }

  // TODO: Document
  hasSettings() {
    return this.defaultSettings.size > 0;
  }

  /**
   * Gets a list of setting names for a command
   * @returns {string[]} - Array of setting names for the command
   */
  keys() {
    return Array.from(this.defaultSettings.keys());
  }

  /**
   * Gets the Command setting value for a given Guild
   * @param {string} guildId - The ID of the Guild to lookup
   * @param {string} key - The Setting key to lookup
   */
  get(guildId, key) {
    const settings = aquarius.guildManager
      .get(guildId)
      .getCommandSettings(this.name);

    if (settings.has(key)) {
      return settings.get(key);
    }

    return this.defaultSettings.get(key);
  }

  // TODO: Document
  set(guildId, key, value) {
    const guild = aquarius.guildManager.get(guildId);
    const settings = guild.getCommandSettings(this.name);

    settings.set(key, value);
    guild.setCommandSettings(this.name, settings);
  }

  // TODO: Document
  remove(guildId, key) {
    const guild = aquarius.guildManager.get(guildId);
    const settings = guild.getCommandSettings(this.name);

    settings.delete(key);
    guild.setCommandSettings(this.name, settings);
  }

  // TODO: Document
  clear(guildId) {
    aquarius.guildManager.get(guildId).removeCommandSettings(this.name);
  }
}
