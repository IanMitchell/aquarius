import Sentry from '@aquarius-bot/sentry';
import debug from 'debug';
import aquarius from '../../aquarius';
import database from '../database/database';
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

    /**
     * Commands that are active on a guild.
     * The items listed below are the default commands
     * available when Aquarius joins a server
     * @type {Set}
     */
    this.enabledCommands = new Set(aquarius.config.defaultCommands);

    /**
     * Command configuration options per guild
     * @type {Map}
     */
    this.commandConfig = new Map();

    /**
     * The Relation ID to save new database recores with
     * @type {Number}
     * TODO: Make private
     */
    this.guildSettingId = null;

    // Setup datastructure (overridden by loadSettings)
    Array.from(this.enabledCommands).forEach((name) => {
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
  async ignoreUser(id) {
    if (!this.ignoredUsers.has(id)) {
      this.ignoredUsers.add(id);

      try {
        await database.ignoredUser.create({
          data: {
            userId: id,
            guildSetting: {
              connect: {
                guildId: this.id,
              },
            },
          },
        });
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  }

  /**
   * Removes a User from the Guild ignore list and updates the Database
   * @param {string} id - User ID for the User
   */
  async unignoreUser(id) {
    if (this.ignoredUsers.has(id)) {
      this.ignoredUsers.delete(id);

      try {
        await database.ignoredUser.delete({
          where: {
            userId: id,
            guildSettingId: this.guildSettingId,
          },
        });
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  }

  /**
   * Enables a command for the Guild and saves it to the database
   * @param {string} name - Name of the command to enable
   */
  async enableCommand(name) {
    if (!this.enabledCommands.has(name)) {
      this.enabledCommands.add(name);
      this.setCommandSettings(name, new Map(), false);

      try {
        await database.enabledCommand.upsert({
          where: {
            guildSettingId_name: {
              guildSettingId: this.guildSettingId,
              name,
            },
          },
          create: {
            name,
            enabled: true,
            guildSetting: {
              connect: {
                guildId: this.guildSettingId,
              },
            },
          },
          update: {
            enabled: true,
          },
        });
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  }

  /**
   * Disables a command for the Guild and saves it to the database
   * @param {string} name - Name of the command to disable
   */
  async disableCommand(name) {
    this.enabledCommands.delete(name);
    this.removeCommandSettings(name, false);

    try {
      await database.enabledCommand.update({
        where: {
          guildSettingId_name: {
            guildSettingId: this.guildSettingId,
            name,
          },
        },
        data: {
          enabled: false,
        },
      });
    } catch (error) {
      log(error);
      Sentry.captureException(error);
    }
  }

  /**
   * Gets the Settings for a given Command.
   * @param {string} name - Command name to lookup.
   * @return {Map}
   */
  getCommandSettings(name) {
    return this.commandConfig.get(name) ?? new Map();
  }

  /**
   * Sets and persists command settings for a command
   * @param {string} name - Command name to set a config for
   * @param {Object} config - Command config to persist
   * @param {boolean} [save=true] - Whether to persist changes in the database
   */
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

    setTimeout(() => this.unMuteGuild(), duration);

    try {
      await database.guildSetting.update({
        where: {
          guildId: this.id,
        },
        data: {
          mute: Date.now() + duration,
        },
      });
    } catch (error) {
      log(error);
      Sentry.captureException(error);
    }
  }

  /**
   * Marks a guild as being unmuted and updates the database
   */
  async unMuteGuild() {
    if (this.muted) {
      log(`Unmuting ${this.id}`);
      this.muted = false;

      try {
        await database.guildSetting.update({
          where: {
            guildId: this.id,
          },
          data: {
            mute: undefined,
          },
        });
      } catch (error) {
        log(error);
        Sentry.captureException(error);
      }
    }
  }

  /**
   * Loads from the database and overrides current settings
   */
  async loadSettings() {
    try {
      const guildSetting = await database.guildSetting.findOne({
        where: {
          guildId: this.id,
        },
        include: {
          ignoredUsers: true,
          commands: {
            include: {
              configs: true,
            },
          },
        },
      });

      if (!guildSetting) {
        log(`No settings found for ${this.id}`);
        this.saveSettings();
      } else {
        this.guildSettingId = guildSetting.id;

        this.enabledCommands = new Set(
          guildSetting.commands
            .filter((cmd) => cmd.enabled)
            .map((cmd) => cmd.name)
        );

        this.ignoredUsers = new Set(
          guildSetting.ignoredUsers.map((ignore) => ignore.userId)
        );

        this.commandConfig = new Map(
          guildSetting.commands.map((cmd) => [
            cmd.name,
            new Map(
              cmd.configs
                .filter((config) => config.commandId === cmd.id)
                .map((cfg) => [cfg.key, cfg.value])
            ),
          ])
        );

        this.muted = guildSetting.mute;

        if (Date.now() < guildSetting.mute) {
          this.muteGuild(guildSetting.mute - Date.now());
        } else {
          this.unMuteGuild();
        }
      }
    } catch (error) {
      log(error);
      Sentry.captureException(error);
    }
  }

  /**
   * Serializes the settings to a database
   */
  async saveSettings() {
    log(`Saving settings for ${this.id}`);
    try {
      // First save top level settings and commands
      const guildSetting = await database.guildSetting.upsert({
        where: {
          guildId: this.id,
        },
        create: {
          guildId: this.id,
          mute: this.muted ? this.muted : undefined,
        },
        update: {
          mute: this.muted ? this.muted : undefined,
        },
      });

      // Assign the record ID
      this.guildSettingId = guildSetting.id;

      // Since we need the guildSetting Record ID, we have to do this after
      // the initial record is created. Here, we loop through each command and
      // either update or create a record for it
      const commands = await Promise.all(
        Array.from(this.enabledCommands).map((cmd) => {
          return database.enabledCommand.upsert({
            where: {
              guildSettingId_name: {
                guildSettingId: guildSetting.id,
                name: cmd,
              },
            },
            create: {
              name: cmd,
              enabled: true,
              guildSetting: {
                connect: {
                  id: this.guildSettingId,
                },
              },
            },
            update: {
              enabled: true,
            },
          });
        })
      );

      // Finally, for each command we also need to save its config. As before,
      // we need the record ID in order to perform this action so it has to come
      // after. Here, we loop through each command, then loop through each
      // setting and either update or create a record for it
      await Promise.all(
        commands.map((command) => {
          return Promise.all(
            Array.from(this.getCommandSettings(command.name).entries()).map(
              ([key, value]) => {
                return database.commandConfig.upsert({
                  where: {
                    commandId_key: {
                      commandId: command.id,
                      key,
                    },
                  },
                  create: {
                    key,
                    value,
                    command: {
                      connect: {
                        id: command.id,
                      },
                    },
                  },
                  update: {
                    value,
                  },
                });
              }
            )
          );
        })
      );
    } catch (error) {
      log(error);
      Sentry.captureException(error);
    }
  }
}
