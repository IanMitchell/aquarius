import { URL } from 'url';
import pkg from '../../../package.json';
import aquarius from '../../aquarius.js';

/**
 * Get the raw URL to add Aquarius to your Guild
 * @returns {string} The raw URL for Discord's Add Bot prompt
 */
export function botLink() {
  const url = new URL('https://discordapp.com/oauth2/authorize');
  url.searchParams.append('client_id', process.env.CLIENT_ID);
  url.searchParams.append('scope', 'bot');

  // TODO: Can this be dynamically calculated from flags in Commands?
  url.searchParams.append('permissions', '1543892032');
  return url.href;
}

/**
 * Get the host URL for Aquarius
 * @return {string} The service URL for Aquarius (localhost in development mode)
 */
export function getHost() {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : aquarius.config.url;
}

/**
 * Get the URL redirect to add Aquarius to your Guild
 * @returns {string} The URL redirect for Discord's Add Bot prompt
 */
export function getVanityBotLink() {
  return `${getHost()}/link`;
}

/**
 * Get the URL for the Aquarius Repository
 * @returns {string} The URL for the GitHub Repository
 */
export function getGitHubLink() {
  return `http://github.com/${pkg.repository}`;
}

/**
 * Get the URL for Aquarius Documentation
 * @returns {string} The URL for the documentation
 */
export function getDocsLink() {
  return `${getHost()}/docs`;
}
