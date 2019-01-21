import { URL } from 'url';
import pkg from '../../../package';

/**
 * Get the raw URL to add Aquarius to your Guild
 * @returns {string} The raw URL for Discord's Add Bot prompt
 */
export function botLink() {
  const url = new URL('https://discordapp.com/oauth2/authorize');
  url.searchParams.append('client_id', process.env.CLIENT_ID);
  url.searchParams.append('scope', 'bot');
  url.searchParams.append('permissions', '0'); // TODO: Set defaults?
  return url.href;
}

// TODO: Document
export function getHost() {
  return process.env.NOW_URL || 'http://localhost:3000';
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
 * Get the URL for the Aquarius Dashboard
 * @returns {string} The URL for the dashboard
 */
export function getDashboardLink() {
  // TODO: Generate Web Link
  return '';
}


/**
 * Get the URL for Aquarius Documentation
 * @returns {string} The URL for the documentation
 */
export function getDocsLink() {
  // TODO: Generate Docs Link
  return `${getHost()}/docs`;
}
