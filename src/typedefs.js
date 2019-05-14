// Custom types for VS Code Intellisense

/**
 * @typedef {import('./index').Aquarius} Aquarius
 * @typedef {import('./lib/commands/settings').default} Settings
 * @typedef {import{'./lib/analytics/commands'}.default} Analytics
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
 * @property {string} usage - A DocOpt usage description
 */

// Needed to have typedefs work
export default () => {};
