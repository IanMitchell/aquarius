import debug from 'debug';
import aquarius from '../../aquarius.js';
import GuildSettings from '../settings/guild-settings.js';

const log = debug('Guild Manager');

/**
 * Manages the list of Guilds Aquarius is part of
 */
export default class GuildManager extends Map {
  /**
   * Registers handlers to run once Aquarius has logged on and
   * loads information on boot.
   */
  initialize() {
    log('Initializing Settings');

    this.loadSettings();

    aquarius.on('guildCreate', guild => {
      this.addGuild(guild.id);
    });
  }

  /**
   * Adds Settings for a Guild
   * @param {string} id - The Guild ID to add Settings for
   */
  addGuild(id) {
    this.set(id, new GuildSettings(id));
  }

  /**
   * Checks to see if a Guild is currently Muted
   * @param {string} id - The Guild ID to check Mute status for
   * @returns {boolean|Number} Returns False if not muted or the amount of
   * seconds the guild is muted for
   */
  isGuildMuted(id) {
    if (this.has(id)) {
      return this.get(id).muted;
    }

    return false;
  }

  /**
   * For each Guild Aquarius is in add the Guild to the list
   */
  loadSettings() {
    aquarius.guilds.array().forEach(guild => this.addGuild(guild.id));
  }
}
