import { fixPartialReactionEvents } from '@aquarius-bot/discordjs-fixes';
import {
  isAsyncCommand,
  startLoading,
  stopLoading,
} from '@aquarius-bot/loading';
import { isDirectMessage } from '@aquarius-bot/messages';
import Sentry from '@aquarius-bot/sentry';
import * as triggers from '@aquarius-bot/triggers';
import { isBot } from '@aquarius-bot/users';
import chalk from 'chalk';
import Discord, { Intents } from 'discord.js';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import Analytics from './core/commands/analytics';
import Settings from './core/commands/settings';
import database from './core/database/database';
import { getDirname } from './core/helpers/files';
import * as permissions from './core/helpers/permissions';
import getLogger, { getMessageMeta } from './core/logging/log';
import DirectMessageManager from './core/managers/direct-message-manager';
import EmojiManager from './core/managers/emoji-manager';
import GuildManager from './core/managers/guild-manager';
import ServiceManager from './core/managers/service-manager';
import { setupDailySnapshotLoop } from './core/metrics/discord';
import CommandConfig from './core/settings/command-config';
import TriggerMap from './core/settings/trigger-map';

const log = getLogger('Aquarius');

/**
 * @typedef { import('@prisma/client').PrismaClient } PrismaClient
 * @typedef { import('discord.js').Guild } Guild
 * @typedef { import('discord.js').Message } Message
 * @typedef { import('./typedefs').CommandInfo } CommandInfo
 * @typedef { import('./typedefs').CommandHandler } CommandHandler
 *
 * @typedef {( message: Message, regex: RegExp ) => RegExpMatchArray|false} MatchFn
 */

/**
 * The core Aquarius client
 */
export class Aquarius extends Discord.Client {
  constructor() {
    log.info('Booting up...');
    super({
      ws: { intents: Intents.ALL },
      disableMentions: 'everyone',
      allowedMentions: { parse: ['users'] } 
    });

    // We have more listeners than normal - each command registers one to
    // several on average, so we hit the warning frequently. Small bumps
    // ensure no actual leaks (as opposed to setting the limit to a billion)
    this.setMaxListeners(100);

    // Setup internal data structures

    /**
     * Static configuration for Aquarius
     * TODO: Set type
     */
    this.config = this.loadConfig();

    /**
     * Database connection for Aquarius
     * @type {PrismaClient}
     */
    this.database = database;

    /**
     * Manages the Guilds for which Aquarius is a member
     * @type { typeof import('./core/managers/guild-manager') }
     */
    this.guildManager = new GuildManager();

    /**
     * Manages the configuration for all the Commands and Plugins
     * @type {Map}
     */
    this.commandConfigs = new Map();

    /**
     * Interface for sliding into a User's DMs
     * @type { typeof import('./core/managers/direct-message-manager') }
     */
    this.directMessages = new DirectMessageManager();

    /**
     * A list of custom emoji for usage in messages.
     * @type { typeof import('./core/managers/emoji-manager') }
     */
    this.emojiList = new EmojiManager();

    /**
     * A list of every command and plugin
     * @type {Set}
     */
    this.commandList = new Map();

    /**
     * Holds the Help information for each Command and Plugin
     * @type {Map}
     */
    this.help = new Map();

    /**
     * Associates RegExp triggers with the Command that registered them
     * @type { typeof import('./core/settings/trigger-map') }
     */
    this.triggerMap = new TriggerMap();

    // Setup API

    /**
     * A collection of helper functions to use when dealing with Discord
     * Permissions
     * @type { typeof import('./core/helpers/permissions') }
     */
    this.permissions = permissions;

    /**
     * TODO: document
     * @type { typeof import('./core/managers/service-manager') }
     */
    this.services = new ServiceManager();

    /**
     * Triggers of stuff
     * @type { typeof import('./core/core/triggers') }
     */
    this.triggers = triggers;

    // Apply discord.js Fixes
    fixPartialReactionEvents(this);

    // Load Commands and Plugins
    this.loadGlobals();
    this.loadCommands();

    this.on('ready', this.initialize);
    this.on('error', (error) => {
      log.fatal(error.message);
      Sentry.captureException(error);
    });
  }

  /**
   * Initialization logic that runs after the bot has logged in
   * @todo Make this method private
   */
  initialize() {
    this.guildManager.initialize();
    this.emojiList.initialize();
    setupDailySnapshotLoop();
  }

  /**
   * Loads and returns the config file
   * @todo Make this method private
   */
  loadConfig() {
    const configPath = path.join(getDirname(import.meta.url), '../config.yml');
    return Object.freeze(yaml.safeLoad(fs.readFileSync(configPath)));
  }

  /**
   * Loads and initializes all global commands and plugins
   * @todo Make this method private
   */
  loadGlobals() {
    log.info('Loading Global Commands...');
    this.loadDirectory(
      path.join(getDirname(import.meta.url), 'global/commands'),
      true
    );
    log.info('Loading Global Plugins...');
    this.loadDirectory(
      path.join(getDirname(import.meta.url), 'global/plugins'),
      true
    );
  }

  /**
   * Loads and initializes all non-global commands and plugins
   * @todo Make this method private
   */
  loadCommands() {
    log.info('Loading Bot Commands...');
    this.loadDirectory(path.join(getDirname(import.meta.url), 'bot/commands'));
    log.info('Loading Bot Plugins...');
    this.loadDirectory(path.join(getDirname(import.meta.url), 'bot/plugins'));

    // Disabled until we have custom commands
    // log('Loading Custom Bot Commands...');
    // this.loadDirectory(
    //   path.join(getDirname(import.meta.url), 'custom/commands')
    // );
    log.info('Loading Custom Bot Plugins...');
    this.loadDirectory(
      path.join(getDirname(import.meta.url), 'custom/plugins')
    );
  }

  /**
   * Loads each JavaScript file in a given directory
   * @param {string} directory - directory to load `.js` files from
   * @param {boolean} [globalFile=false] - whether to treat the file as global
   * @todo Make this method private
   */
  loadDirectory(directory, globalFile = false) {
    fs.readdir(directory, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach((file) => this.loadFile(directory, file, globalFile));
    });
  }

  /**
   * Loads and initializes a command from the given file. Should only be
   * called by Aquarius.
   * @param {string} directory - directory to load files from
   * @param {strong} file - path to the file to load
   * @param {boolean} globalFile - whether the loaded item is a global or not
   * @todo Make this method private
   */
  async loadFile(directory, file, globalFile) {
    if (file.endsWith('.js')) {
      log.info(`Loading ${chalk.blue(file)}`);

      try {
        const command = await import(path.join(directory, file));

        // Set Global Flag
        command.info.global = globalFile;

        // If command currently disabled, early exit
        if (command.info.disabled) {
          log.warn(`${chalk.blue(command.info.name)} is disabled`);
          return;
        }

        // Initialize Command
        try {
          if (this.commandConfigs.has(command.info.name)) {
            throw new Error('Duplicate Name Registration In Config Manager');
          }

          // Create Config
          this.commandConfigs.set(
            command.info.name,
            new CommandConfig(command.info.name)
          );

          await command.default({
            aquarius: this,
            analytics: new Analytics(command.info.name),
            settings: new Settings(command.info.name),
          });

          // Register Help Information
          this.addHelp(command.info);

          // TODO: Gonna have to make a better system for this
          // Create a map of regex triggers and commands
          this.triggerMap.setCurrentCommand(command.info);
          await command.default({
            aquarius: this.triggerMap,
            settings: {
              register: () => {},
            },
            analytics: {},
          });

          this.commandList.set(command.info.name, command.info);
        } catch (error) {
          log.error(error.message);
          Sentry.captureException(error);
        }
      } catch (error) {
        log.fatal(error.message, { file });
        Sentry.captureException(error);
        process.exit(1);
      }
    }
  }

  /**
   * Get the list of Global Command Names
   * @return {string[]} List of Global Command Names
   */
  getGlobalCommandNames(includeHidden = true) {
    return Array.from(this.help.entries())
      .filter(([, info]) => info.global && (includeHidden || !info.hidden))
      .map(([key]) => key.toLowerCase());
  }

  /**
   * Registers a command's help information. If the command name has already
   * been registered an error will be thrown
   * @param {CommandInfo} commandInfo - Command to add to Help system
   * @todo Make this method private
   */
  addHelp(commandInfo) {
    if (this.help.has(commandInfo.name)) {
      throw new Error('Duplicate Help Registration');
    }

    this.help.set(commandInfo.name, commandInfo);
  }

  /**
   * Checks to see if a guild has a command enabled
   * @param {Guild} guild - Guild to check
   * @param {CommandInfo} commandInfo - Command to check
   * @returns {boolean} whether the guild has the command enabled or not
   */
  isCommandEnabled(guild, commandInfo) {
    const guildSettings = this.guildManager.get(guild.id);

    if (commandInfo.global) {
      return !guildSettings.muted;
    }

    return guildSettings.isCommandEnabled(commandInfo.name);
  }

  /**
   * Checks to see if a user can activate a command. This checks to see if the
   * user is ignored or the command is disabled
   * @param {Message} message - Message containing the activation command
   * @param {CommandInfo} commandInfo - Command to check
   * @returns {boolean} Whether the user can activate the command or not
   * @todo Make this method private
   */
  isUsageAllowed(message, commandInfo) {
    if (!this.isCommandEnabled(message.guild, commandInfo)) {
      return false;
    }

    if (this.permissions.isUserIgnored(message.guild, message.author)) {
      return false;
    }

    return true;
  }

  /**
   * Checks a message to see if it activates a command
   * @param {Message} message - Message to check
   * @param {RegExp} regex - RegExp to check against the message content
   * @param {CommandHandler} handler - Command activation function that takes a
   * @param {MatchFn} matchFn - Function that matches against the message content
   * @todo Make this method private
   */
  async handleCommand(message, regex, handler, matchFn) {
    if (isDirectMessage(message)) {
      return;
    }

    const commandInfo = this.triggerMap.get(regex.toString());
    let isLoading = false;

    if (this.isUsageAllowed(message, commandInfo)) {
      try {
        const match = matchFn(message, regex);
        if (match) {
          if (isAsyncCommand(handler)) {
            isLoading = true;
            startLoading(message.channel);
          }

          // TODO: Benchmark?
          await handler(message, match);
        }
      } catch (error) {
        log.error(error.message, getMessageMeta(message));
        Sentry.captureException(error);
      } finally {
        if (isLoading && isAsyncCommand(handler)) {
          stopLoading(message.channel);
        }
      }
    }
  }

  /**
   * Checks a message to see if it activates a command. This should be used
   * when a command needs to check each message itself rather than providing
   * a Regex trigger pattern.
   * @param {Message} message - Message to check
   * @param {CommandInfo} commandInfo - Command info for command to check activation for
   * @param {CommandHandler} handler - Command activation function that takes a
   * @param {MatchFn} matchFn - Function that matches against the message content
   * @todo Make this method private
   */
  async handleMessage(message, commandInfo, handler, matchFn) {
    if (isDirectMessage(message)) {
      return;
    }

    let isLoading = false;

    if (this.isUsageAllowed(message, commandInfo) && !isBot(message.author)) {
      try {
        const match = matchFn(message);

        if (match) {
          if (isAsyncCommand(handler)) {
            isLoading = true;
            startLoading(message.channel);
          }

          // TODO: Benchmark?
          handler(message, match);
        }
      } catch (error) {
        log.error(error, getMessageMeta(message));
        Sentry.captureException(error);
      } finally {
        if (isLoading && isAsyncCommand(handler)) {
          stopLoading(message.channel);
        }
      }
    }
  }

  /**
   * Registers a handler function for Direct Messages that match the provided
   * RegExp pattern
   * @param {RegExp} regex - RegExp pattern to check the DM against
   * @param {CommandHandler} handler - Handler function for matching messages
   */
  onDirectMessage(regex, handler) {
    this.on('message', (message) => {
      Sentry.withMessageScope(message, () => {
        if (message.channel.type === 'dm') {
          if (isBot(message.author)) {
            return;
          }

          const match = this.triggers.customTrigger(message, regex);

          if (match) {
            if (this.directMessages.isActive(message.author)) {
              log.info(
                `Ignoring Message due to inflight request: ${chalk.blue(
                  message.cleanContent
                )}`
              );
              message.channel.send(
                "_(It looks like you might be trying to use a command - I can't do two at once! You can stop the current command by sending `Stop`)_"
              );
              return;
            }

            handler(message, match);
          }
        }
      });
    });
  }

  /**
   * Registers a handler function for every message received by Aquarius
   * in guilds that have the command enabled by users that can invoke the command
   * @param {CommandInfo} info - Command information for the command adding
   * the listener
   * @param {CommandHandler} handler - Function that runs on successful triggers.
   * `match` will be set to `true`
   */
  onMessage(info, handler) {
    this.on('message', (message) => {
      Sentry.withMessageScope(message, () => {
        this.handleMessage(message, info, handler, () => true);
      });
    });
  }

  /**
   * Registers a handler function for all messages that match the provided
   * RegExp pattern in guilds that have the command enabled by users that can
   * invoke the command.
   *
   * **Note**: Automatically checks for Command Invocation Syntax.
   * This means it will only trigger on messages prepended with
   * `@Aquarius`, `.`, `!`, etc. - without the pattern being defined in the
   * provided RegExp. If you want to match against the RegExp pattern **exactly**
   * use `onTrigger` instead.
   *
   * For more complicated usages (rare) see `onDynamicTrigger`.
   * @param {RegExp} regex - RegExp pattern to check the message content with
   * @param {CommandHandler} handler - Callback invoked for trigger messages
   */
  onCommand(regex, handler) {
    this.on('message', (message) => {
      Sentry.withMessageScope(message, () => {
        this.handleCommand(
          message,
          regex,
          handler,
          this.triggers.messageTriggered
        );
      });
    });
  }

  /**
   * Registers a handler function for all messages that match the provided
   * RegExp pattern **exactly** in guilds that have the command enabled by users
   * that can invoke the command.
   *
   * **Note**: Does not automatically check for Command Invocation Syntax.
   * If you want to register a pattern that should be invoked by prepending
   * messages with `@Aquarius`, `.`, `!`, etc) use `onCommand` instead.
   *
   * For more complicated usages (rare) see `onDynamicTrigger`.
   * @param {RegExp} regex - RegExp pattern to check the message content with
   * @param {CommandHandler} handler - Callback invoked for trigger messages
   */
  onTrigger(regex, handler) {
    this.on('message', (message) => {
      Sentry.withMessageScope(message, () => {
        this.handleCommand(
          message,
          regex,
          handler,
          this.triggers.customTrigger
        );
      });
    });
  }

  /**
   * Registers a handler function for all messages that successfully pass the
   * provided Match callback function in guilds that have the command
   * enabled by users that can invoke the command.
   *
   * **Note**: This should only be used in rare cases where static RegExp
   * patterns aren't sufficient. For example, you might need this if your
   * command is invoked differently per guild depending on a command setting.
   * @param {CommandInfo} commandInfo - Command registering the dynamic trigger
   * @param {MatchFn} matchFn - Function that checks for successful matches
   * @param {CommandHandler} handler - Callback invoked for trigger messages
   */
  onDynamicTrigger(commandInfo, matchFn, handler) {
    this.on('message', (message) => {
      Sentry.withMessageScope(message, () => {
        this.handleMessage(message, commandInfo, handler, matchFn);
      });
    });
  }

  /**
   * Creates a periodic loop that triggers the callback for each guild that has enabled the command.
   * @param {CommandInfo} commandInfo - Command registering the loop
   * @param {(guild: Guild) => {}} callback - Function called per guild that has enabled the command
   * @param {number} frequency - How frequently to run the loop
   */
  loop(commandInfo, callback, frequency) {
    this.on('ready', () => {
      setInterval(() => {
        this.guilds.cache.forEach((guild) => {
          if (
            this.guildManager.get(guild.id).isCommandEnabled(commandInfo.name)
          ) {
            callback(guild);
          }
        });
      }, frequency);
    });
  }
}

const aquarius = (() => {
  const bot = new Aquarius();
  bot.login(process.env.TOKEN).catch((error) => log.fatal(error.message));
  return bot;
})();
export default aquarius;
