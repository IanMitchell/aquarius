import Sentry from '@aquarius-bot/sentry';
import chalk from 'chalk';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import database from '../database/database';
import { getDirname } from '../helpers/files';
import getLogger from '../logging/log';

const log = getLogger('ServiceManager');

/**
 * @typedef {import('discord.js').User} User
 *
 * @typedef {Object} ServiceConfiguration
 * @property {string} name - Name of the service
 * @property {number} version - Version of service configuration
 * @property {Object} steps - Information required to link the Service to a User
 * @property {string} steps.field - Name of the field
 * @property {boolean} steps.public - Flag indicating if the field should be used privately (API Key) or publicly (Username)
 * @property {string} steps.instructions - Description of what information to enter into the field
 */

/**
 * Manages the various services you can connect to Aquarius
 */
export default class ServiceManager {
  constructor() {
    /**
     * @type {Map<string, ServiceConfiguration>}
     */
    this.services = new Map();

    const serviceDirectory = path.join(
      getDirname(import.meta.url),
      '../../../data/services'
    );

    fs.readdir(serviceDirectory, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach(async (file) => {
        if (file.endsWith('.yml')) {
          log.info(`Loading ${chalk.blue(file)}`);

          const filePath = path.join(serviceDirectory, file);
          const { name, version, steps } = yaml.load(fs.readFileSync(filePath));

          this.services.set(name.toLowerCase(), { name, version, steps });
        }
      });
    });
  }

  /**
   * Get the array of names for supported services
   * @returns {string[]} List of supported service names
   */
  getNames() {
    // eslint-disable-next-line no-unused-vars
    return Array.from(this.services.entries()).map(([_, value]) => value.name);
  }

  /**
   * Determines if a service is supported or not
   * @param {string} name - Name of the service to lookup
   * @returns {boolean} Is the service supported or not
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Get information about a supported Service
   * @param {string} name - Name of the service to retrieve information for
   * @returns {?ServiceConfiguration} Information about the Service
   */
  getInformation(name) {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    return null;
  }

  /**
   * Get a list of all the raw Service links for a User. For most uses
   * `getLinks` will be more useful.
   * @param {User} user - User to retrieve keys for
   * @returns {string[]} List of keys for linked Services
   */
  async getKeysForUser(user) {
    try {
      const services = await database.service.findMany({
        where: {
          userId: user.id,
        },
      });

      if (!services) {
        return [];
      }

      return services.map((service) => service.name);
    } catch (error) {
      log.error(error.message);
      Sentry.captureException(error);
      return [];
    }
  }

  /**
   * Get a list of Services that have been linked to a User
   * @param {User} user - User to retrieve service links
   * @returns {string[]} List of services linked to a User
   */
  async getLinks(user) {
    log.info(`Retrieving service list for ${chalk.green(user.username)}`);

    const keys = await this.getKeysForUser(user);
    return keys
      .map((key) => this.services.has(key) && this.services.get(key).name)
      .filter(Boolean);
  }

  /**
   * Get information about a Service link
   * @param {User} user - User to retrieve link for
   * @param {string} service - Service name to retrieve
   * @returns {?Object.<string, string>} Field name and User Input in a Key/Value structure
   */
  async getLink(user, service) {
    log.info(
      `Retrieving ${chalk.blue(service)} for ${chalk.green(user.username)}`
    );

    return database.service.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: service.toLowerCase(),
        },
      },
    });
  }

  /**
   * Creates a new service link for a user
   * @param {User} user - User to add a link to
   * @param {string} name - Service name to link
   * @param {Object.<string, string>} fields - List of field values to store
   * @returns {Promise} Promise of pending database transaction
   */
  async setLink(user, name, fields) {
    log.info(`Setting ${chalk.blue(name)} for ${chalk.green(user.username)}`);

    return database.service.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: name.toLowerCase(),
        },
      },
      create: {
        userId: user.id,
        name: name.toLowerCase(),
        values: fields,
      },
      update: {
        values: fields,
      },
    });
  }

  /**
   * Removes a service link from a user account
   * @param {User} user - User to unlink
   * @param {string} service - Service to unlink
   * @returns {Promise} Promise of pending database transaction
   */
  async removeLink(user, service) {
    log.info(
      `Removing ${chalk.blue(service)} for user ${chalk.green(user.username)}`
    );

    return database.service.delete({
      where: {
        userId_name: {
          userId: user.id,
          name: service.toLowerCase(),
        },
      },
    });
  }
}
