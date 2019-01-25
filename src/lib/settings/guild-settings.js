import debug from 'debug';
import database from '../database';
import { serializeMap, deserializeMap } from '../database/serialization';
import { TEN_MINUTES } from '../helpers/times';

const log = debug('Guild Setting');

/** @typedef { import('../commands/settings').default } Settings */

/**
 * Default duration Aquarius is muted for in milliseconds
 * @constant {number}
 */
export const MUTE_DURATION = TEN_MINUTES;

/**
 * Represents a Guild Configuration
 */
export default class GuildSettings {
  /**
   * Creates a new GuildSettings with default values before loading
   * existing settings if they exist from the database
   * @param {string} id - The Guild ID
   */
  constructor(id) {
    /**
     * Guild ID
     * @type {string}
     */
    this.id = id;

    /**
     * Controls whether the bot is muted in the guild currently
     * @type {boolean|Number}
     */
    this.muted = false;

    /**
     * List of ignored users
     * @type {Set}
     */
    this.ignoredUsers = new Set();

    // TODO: Move the below to `config.yaml`
    /**
     * Commands that are active on a guild.
     * The items listed below are the default commands
     * available when Aquarius joins a server
     * @type {Set}
     */
    this.enabledCommands = new Set([
      '8ball',
      'choose',
      'dadjoke',
      'fizzbuzz',
      'games',
      'karma',
      'order',
      'quotes',
      'reply',
      'seen',
      'slots',
      'weather',
    ]);

    /**
     * Command configuration options per guild
     * @type {Map}
     */
    this.commandConfig = new Map();

    // Setup datastructure (overridden by loadSettings)
    Array.from(this.enabledCommands).forEach(name => {
      this.commandConfig.set(name, new Map());
    });

    // Initialize with persisted values
    this.loadSettings();
  }

  /**
   * Checks to see if the command is enabled for the guild
   * @param {string} name - The name of the command to check
   * @returns {boolean} Whether the command is enabled
   */
  isCommandEnabled(name) {
    if (this.muted) {
      return false;
    }

    return this.enabledCommands.has(name);
  }

  /**
   * Checks to see if Aquarius is ignoring a user in the guild
   * @param {string} id - The User ID
   * @returns {boolean} Whether the User is ignored
   */
  isUserIgnored(id) {
    return this.ignoredUsers.has(id);
  }

  /**
   * Adds a User to the Guild ignore list and updates the Database
   * @param {string} id - User ID for the User
   */
  ignoreUser(id) {
    this.ignoredUsers.add(id);
    this.saveSettings();
  }

  /**
   * Removes a User from the Guild ignore list and updates the Database
   * @param {string} id - User ID for the User
   */
  unignoreUser(id) {
    this.ignoredUsers.delete(id);
    this.saveSettings();
  }

  /**
   * Enables a command for the Guild and saves it to the database
   * @param {string} name - Name of the command to enable
   */
  enableCommand(name) {
    this.enabledCommands.add(name);
    this.setCommandSettings(name, new Map(), false);
    this.saveSettings();
  }

  /**
   * Disables a command for the Guild and saves it to the database
   * @param {string} name - Name of the command to disable
   */
  disableCommand(name) {
    this.enabledCommands.delete(name);
    this.removeCommandSettings(name, false);
    this.saveSettings();
  }

  /**
   * Gets the Settings for a given Command.
   * @param {string} name - Command name to lookup.
   * @return {Map}
   */
  getCommandSettings(name) {
    return this.commandConfig.get(name) || new Map();
  }

  // TODO: Document
  setCommandSettings(name, config, save = true) {
    this.commandConfig.set(name, config);

    if (save) {
      this.saveSettings();
    }
  }

  /**
   * Removes the Settings for a command and updates the database
   * @param {string} name - Command name
   */
  removeCommandSettings(name, save = true) {
    this.commandConfig.delete(name);

    if (save) {
      this.saveSettings();
    }
  }

  /**
   * Mutes a guild for a specified duration and updates the database
   * @param {number} [duration=MUTE_DURATION] - Duration in seconds
   */
  async muteGuild(duration = MUTE_DURATION) {
    log(`Muting ${this.id}`);

    this.muted = duration;

    setTimeout(
      () => this.unMuteGuild(),
      duration
    );

    database.guildSettings.doc(this.id).set({
      mute: Date.now() + duration,
    }, { merge: true });
  }

  /**
   * Marks a guild as being unmuted and updates the database
   */
  unMuteGuild() {
    if (this.muted) {
      log(`Unmuting ${this.id}`);
      this.muted = false;
      this.saveSettings();
    }
  }

  /**
   * Loads from the database and overrides current settings
   */
  async loadSettings() {
    const guild = await database.guildSettings.doc(this.id).get();

    if (!guild.exists) {
      log(`No settings found for ${this.id}`);
      this.saveSettings();
    } else {
      const data = guild.data();

      log(`Loading settings for ${this.id}`);
      this.enabledCommands = new Set(data.enabledCommands);
      this.ignoredUsers = new Set(data.ignoredUsers);
      this.commandConfig = new Map(
        Object.entries(data.commandConfig).map(([command, settings]) => [command, deserializeMap(settings)])
      );
      this.muted = data.mute;

      if (Date.now() < data.mute) {
        this.muteGuild(data.mute - Date.now());
      } else {
        this.unMuteGuild();
      }
    }
  }

  /**
   * Serializes the settings to a database
   */
  async saveSettings() {
    log(`Saving settings for ${this.id}`);
    try {
      const serializedConfig = Array.from(this.commandConfig.entries())
        .reduce(
          (config, [command, settings]) => Object.assign(config, { [command]: serializeMap(settings) }),
          {}
        );

      return database.guildSettings.doc(this.id).set({
        mute: this.muted,
        enabledCommands: Array.from(this.enabledCommands),
        commandConfig: serializedConfig,
        ignoredUsers: Array.from(this.ignoredUsers),
      }, { merge: true });
    } catch (error) {
      // TODO: Raven Integration
      log(error);
      return null;
    }
  }
}
