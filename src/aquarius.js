import chalk from 'chalk';
import debug from 'debug';
import Discord from 'discord.js';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import Sentry from './lib/errors/sentry';
import * as loading from './lib/core/loading';
import * as permissions from './lib/core/permissions';
import * as services from './lib/core/services';
import * as triggers from './lib/core/triggers';
import database from './lib/database/database';
import DirectMessageManager from './lib/managers/direct-message';
import GuildManager from './lib/managers/guild-manager';
import EmojiManager from './lib/managers/emojis';
import { isDirectMessage, isBot } from './lib/helpers/messages';
import TriggerMap from './lib/settings/trigger-map';
import CommandConfig from './lib/settings/command-config';
import Settings from './lib/commands/settings';
import Analytics from './lib/commands/analytics';
import { setupWeeklyGuildLoop } from './lib/metrics/guilds';
import { fixPartialReactionEvents } from './lib/discord/library-fixes';

const log = debug('Aquarius');
const errorLog = debug('Aquarius:Error');

// TODO: Document

/**
 * The core Aquarius client
 */
export class Aquarius extends Discord.Client {
  constructor() {
    log('Booting up...');
    super();

    // We have more listeners than normal - each command registers one to
    // several on average, so we hit the warning frequently. Small bumps
    // ensure no actual leaks rather than setting the limit to a thousand.
    this.setMaxListeners(60);

    // Setup internal data structures

    /**
     * TODO: Doocument
     */
    this.config = this.loadConfig();

    /**
     *
     * @type { typeof import('./lib/managers/guild-manager') }
     */
    this.guildManager = new GuildManager();

    /**
     * TODO: Document
     * @type {Map}
     */
    this.commandConfigs = new Map();

    /**
     * TODO: Document
     * @type { typeof import('./lib/managers/direct-message') }
     */
    this.directMessages = new DirectMessageManager();

    /**
     * TODO: Document
     * @type { typeof import('./lib/managers/direct-message') }
     */
    this.emojiList = new EmojiManager();

    /**
     * A list of every command and plugin
     * @type {Set}
     */
    this.commandList = new Map();

    /**
     * TODO: Document
     * @type {Map}
     */
    this.help = new Map();

    /**
     * TODO: Document
     * @type { typeof import('./lib/settings/trigger-map') }
     */
    this.triggerMap = new TriggerMap();

    // Setup API

    /**
     * TODO: Document
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
     * @type { typeof import('./lib/core/services') }
     */
    this.services = services;

    /**
     * Triggers of stuff
     * @type { typeof import('./lib/core/triggers') }
     */
    this.triggers = triggers;

    /**
     * TODO: Document
     * @type {}
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
   */
  initialize() {
    // TODO: Make Private
    this.guildManager.initialize();
    this.emojiList.initialize();
    setupWeeklyGuildLoop();
  }

  /**
   * Loads and returns the config file
   */
  loadConfig() {
    // TODO: Make Private
    const configPath = path.join(__dirname, '../config.yml');
    return yaml.safeLoad(fs.readFileSync(configPath));
  }

  /**
   * Loads and initializes all global commands and plugins
   */
  loadGlobals() {
    // TODO: Make Private
    log('Loading Global Commands...');
    this.loadDirectory(path.join(__dirname, 'global/commands'), true);
    log('Loading Global Plugins...');
    this.loadDirectory(path.join(__dirname, 'global/plugins'), true);
  }

  /**
   * Loads and initializes all non-global commands and plugins
   */
  loadCommands() {
    // TODO: Make Private
    log('Loading Bot Commands...');
    this.loadDirectory(path.join(__dirname, 'bot/commands'));
    log('Loading Bot Plugins...');
    this.loadDirectory(path.join(__dirname, 'bot/plugins'));
  }

  /**
   * Loads each JavaScript file in a given directory
   * @param {string} directory - directory to load `.js` files from
   * @param {boolean=false} globalFile - whether to treat the file as global
   */
  loadDirectory(directory, globalFile = false) {
    // TODO: Make Private
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
   */
  async loadFile(directory, file, globalFile) {
    // TODO: Make Private
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
   * @return {Array<string>} List of Global Command Names
   */
  getGlobalCommandNames(includeHidden = true) {
    return Array.from(this.help.entries())
      .filter(([, info]) => info.global && (includeHidden || !info.hidden))
      .map(([key]) => key.toLowerCase());
  }

  // TODO: Document
  addHelp(commandInfo) {
    if (this.help.has(commandInfo.name)) {
      throw new Error('Duplicate Help Registration');
    }

    this.help.set(commandInfo.name, commandInfo);
  }

  // TODO: Document
  isCommandEnabled(guild, commandInfo) {
    const guildSettings = this.guildManager.get(guild.id);

    if (commandInfo.global) {
      return !guildSettings.muted;
    }

    return guildSettings.isCommandEnabled(commandInfo.name);
  }

  // TODO: Document
  isUsageAllowed(message, commandInfo) {
    if (!this.isCommandEnabled(message.guild, commandInfo)) {
      return false;
    }

    if (this.permissions.isUserIgnored(message.guild, message.author)) {
      return false;
    }

    return true;
  }

  // TODO: Document
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

  // TODO: Document
  async handleMessage(message, commandInfo, handler, matchFn) {
    if (isDirectMessage(message)) {
      return;
    }

    if (this.isUsageAllowed(message, commandInfo) && !isBot(message.author)) {
      try {
        const match = matchFn(message);

        if (match) {
          // TODO: Better Raven Usage
          // TODO: Benchmark?
          handler(message, match);
        }
      } catch (error) {
        errorLog(error);
        Sentry.captureException(error);
      }
    }
  }

  // TODO: Document
  onDirectMessage(regex, handler) {
    this.on('message', message => {
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

  // TODO: Document
  onMessage(info, handler) {
    this.on('message', message =>
      this.handleMessage(message, info, handler, () => true)
    );
  }

  // TODO: Document
  onCommand(regex, handler) {
    this.on('message', message =>
      this.handleCommand(
        message,
        regex,
        handler,
        this.triggers.messageTriggered
      )
    );
  }

  // TODO: Document
  onTrigger(regex, handler) {
    this.on('message', message =>
      this.handleCommand(message, regex, handler, this.triggers.customTrigger)
    );
  }

  // TODO: Document
  onDynamicTrigger(commandInfo, matchFn, handler) {
    this.on('message', message =>
      this.handleMessage(message, commandInfo, handler, matchFn)
    );
  }
}

const aquarius = (() => {
  const bot = new Aquarius();
  bot.login(process.env.TOKEN).catch(errorLog);
  return bot;
})();
export default aquarius;
