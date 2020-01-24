import chalk from 'chalk';
import debug from 'debug';
import Discord from 'discord.js';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import Analytics from './lib/commands/analytics';
import Settings from './lib/commands/settings';
import * as loading from './lib/core/loading';
import * as permissions from './lib/core/permissions';
import * as triggers from './lib/core/triggers';
import database from './lib/database/database';
import { fixPartialReactionEvents } from './lib/discord/library-fixes';
import Sentry from './lib/errors/sentry';
import { isBot, isDirectMessage } from './lib/helpers/messages';
import DirectMessageManager from './lib/managers/direct-message-manager';
import EmojiManager from './lib/managers/emoji-manager';
import GuildManager from './lib/managers/guild-manager';
import ServiceManager from './lib/managers/service-manager';
import { setupWeeklyGuildLoop } from './lib/metrics/guilds';
import CommandConfig from './lib/settings/command-config';
import TriggerMap from './lib/settings/trigger-map';

const log = debug('Aquarius');
const errorLog = debug('Aquarius:Error');

/**
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
    log('Booting up...');
    super();

    // We have more listeners than normal - each command registers one to
    // several on average, so we hit the warning frequently. Small bumps
    // ensure no actual leaks (as opposed to setting the limit to a billion)
    this.setMaxListeners(65);

    // Setup internal data structures

    /**
     * Static configuration for Aquarius
     */
    this.config = this.loadConfig();

    /**
     * Manages the Guilds for which Aquarius is a member
     * @type { typeof import('./lib/managers/guild-manager') }
     */
    this.guildManager = new GuildManager();

    /**
     * Manages the configuration for all the Commands and Plugins
     * @type {Map}
     */
    this.commandConfigs = new Map();

    /**
     * Interface for sliding into a User's DMs
     * @type { typeof import('./lib/managers/direct-message-manager') }
     */
    this.directMessages = new DirectMessageManager();

    /**
     * A list of custom emoji for usage in messages.
     * @type { typeof import('./lib/managers/emoji-manager') }
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
     * @type { typeof import('./lib/settings/trigger-map') }
     */
    this.triggerMap = new TriggerMap();

    // Setup API

    /**
     * A collection of helper functions to use when dealing with Discord
     * Permissions
     * @type { typeof import('./lib/core/permissions') }
     */
    this.permissions = permissions;

    /**
     * Control the loading indicators
     * @type { typeof import('./lib/core/loading') }
     */
    this.loading = loading;

    /**
     * TODO: document
     * @type { typeof import('./lib/managers/service-manager') }
     */
    this.services = new ServiceManager();

    /**
     * Triggers of stuff
     * @type { typeof import('./lib/core/triggers') }
     */
    this.triggers = triggers;

    /**
     * Interface for working with the Database
     * @todo define type
     */
    this.database = database;

    // Apply discord.js Fixes
    fixPartialReactionEvents(this);

    // Load Commands and Plugins
    this.loadGlobals();
    this.loadCommands();

    this.on('ready', this.initialize);
    this.on('error', error => {
      errorLog(error);
      Sentry.captureException(error);
    });
  }

  /**
   * Initialization logic that runs after the bot has logged in
   * @todo Make this method private
   */
  initialize() {
    this.services.load();
    this.guildManager.initialize();
    this.emojiList.initialize();
    setupWeeklyGuildLoop();
  }

  /**
   * Loads and returns the config file
   * @todo Make this method private
   */
  loadConfig() {
    const configPath = path.join(__dirname, '../config.yml');
    return Object.freeze(yaml.safeLoad(fs.readFileSync(configPath)));
  }

  /**
   * Loads and initializes all global commands and plugins
   * @todo Make this method private
   */
  loadGlobals() {
    log('Loading Global Commands...');
    this.loadDirectory(path.join(__dirname, 'global/commands'), true);
    log('Loading Global Plugins...');
    this.loadDirectory(path.join(__dirname, 'global/plugins'), true);
  }

  /**
   * Loads and initializes all non-global commands and plugins
   * @todo Make this method private
   */
  loadCommands() {
    log('Loading Bot Commands...');
    this.loadDirectory(path.join(__dirname, 'bot/commands'));
    log('Loading Bot Plugins...');
    this.loadDirectory(path.join(__dirname, 'bot/plugins'));
  }

  /**
   * Loads each JavaScript file in a given directory
   * @param {string} directory - directory to load `.js` files from
   * @param {boolean=false} globalFile - whether to treat the file as global
   * @todo Make this method private
   */
  loadDirectory(directory, globalFile = false) {
    fs.readdir(directory, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach(file => this.loadFile(directory, file, globalFile));
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
      log(`Loading ${file}`);

      try {
        const command = await import(path.join(directory, file));

        // Set Global Flag
        command.info.global = globalFile;

        // If command currently disabled, early exit
        if (command.info.disabled) {
          log(`${chalk.yellow('Warning:')} ${command.info.name} is disabled`);
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
          errorLog(error);
          Sentry.captureException(error);
        }
      } catch (error) {
        errorLog(file);
        errorLog(error);
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

    if (this.isUsageAllowed(message, commandInfo)) {
      try {
        const match = matchFn(message, regex);
        if (match) {
          // TODO: Benchmark?
          await handler(message, match);
        }
      } catch (error) {
        errorLog(error);
        Sentry.captureException(error);
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

    if (this.isUsageAllowed(message, commandInfo) && !isBot(message.author)) {
      try {
        const match = matchFn(message);

        if (match) {
          // TODO: Benchmark?
          handler(message, match);
        }
      } catch (error) {
        errorLog(error);
        Sentry.captureException(error);
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
    this.on('message', message => {
      Sentry.configureMessageScope(message);

      if (message.channel.type === 'dm') {
        if (isBot(message.author)) {
          return;
        }

        const match = this.triggers.customTrigger(message, regex);

        if (match) {
          handler(message, match);
        }
      }
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
    this.on('message', message => {
      Sentry.configureMessageScope(message);

      this.handleMessage(message, info, handler, () => true);
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
    this.on('message', message => {
      Sentry.configureMessageScope(message);

      this.handleCommand(
        message,
        regex,
        handler,
        this.triggers.messageTriggered
      );
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
    this.on('message', message => {
      Sentry.configureMessageScope(message);

      this.handleCommand(message, regex, handler, this.triggers.customTrigger);
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
   * @param {commandInfo} commandInfo - Command registering the dynamic trigger
   * @param {MatchFn} matchFn - Function that checks for successful matches
   * @param {CommandHandler} handler - Callback invoked for trigger messages
   */
  onDynamicTrigger(commandInfo, matchFn, handler) {
    this.on('message', message => {
      Sentry.configureMessageScope(message);
      this.handleMessage(message, commandInfo, handler, matchFn);
    });
  }
}

const aquarius = (() => {
  const bot = new Aquarius();
  bot.login(process.env.TOKEN).catch(errorLog);
  return bot;
})();
export default aquarius;
