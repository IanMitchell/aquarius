// Custom types for VS Code Intellisense

/**
 * @typedef {import('./aquarius').Aquarius} Aquarius
 * @typedef {import('./core/commands/settings').default} Settings
 * @typedef {import('./core/commands/analytics').default} Analytics
 * @typedef {import('discord.js').Message} Message
 */

/**
 * Function that defines commands and plugins
 * @typedef {({ aquarius, settings, analytics}: CommandParameter) => null} Command
 */

/**
 * Description of a CommandParameter passed into Plugins and Commands
 * @typedef {Object} CommandParameter
 * @property {Aquarius} aquarius - reference to the Aquarius Client
 * @property {Settings} settings - modify settings for the command
 * @property {Analytics} analytics - track events for the command
 */

/**
 * Callback function invoked for messages that pass a given RegExp pattern
 * @typedef {( message: Message, match: RegExpMatchArray )} CommandHandler
 */

/**
 * Description of an Embed Field for Discord's Rich Embeds
 * @typedef {Object} EmbedField
 * @property {string} title - Title of the Embed Field
 * @property {string} content - Content of the Embed Field
 */

/**
 * Description of the exported Info object by Commands and Plugins
 * @typedef {Object} CommandInfo
 * @property {string} name - The name of the Command
 * @property {string} description - A short description of the Command's function
 * @property {string} [usage] - A DocOpt usage description
 * @property {number[]} [permissions] - An array of required permissions for the command
 * @property {boolean} [hidden] - Whether the command should show up in the command list or not
 * @property {boolean} [disabled] - Whether the command is currently disabled or not
 * @property {boolean} [deprecated] - Whether the command is deprecated or not
 */

// Needed to have typedefs work
export default () => {};
