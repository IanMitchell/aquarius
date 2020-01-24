import Firestore from '@google-cloud/firestore';
import debug from 'debug';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import database from '../database/database';

const log = debug('ServiceManager');

// TODO: Document

export default class ServiceManager {
  constructor() {
    const serviceDirectory = path.join(__dirname, '../../../data/services');

    fs.readdir(serviceDirectory, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach(async file => {
        if (file.endsWith('.yml')) {
          log(`Loading ${file}`);

          const filePath = path.join(serviceDirectory, file);
          const { name, steps } = yaml.safeLoad(fs.readFileSync(filePath));

          this.services.set(name.toLowerCase(), { name, steps });
        }
      });
    });
  }

  getNames() {
    // eslint-disable-next-line no-unused-vars
    return Array.from(this.services.entries()).map(([_, value]) => value.name);
  }

  has(name) {
    return this.services.has(name);
  }

  getInformation(name) {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    return null;
  }

  async getKeysForUser(user) {
    const list = await database.services.doc(user.id).get();

    if (!list.exists) {
      return [];
    }

    return Object.keys(list.data());
  }

  async getLinks(user) {
    log(`Retrieving service list for ${user.username}`);

    const keys = await this.getKeysForUser(user);
    return keys.map(key => this.services.get(key).name);
  }

  async getLink(user, service) {
    log(`Retrieving ${service} for ${user.username}`);

    const serviceList = await database.services.doc(user.id).get();

    if (!serviceList.exists) {
      return null;
    }

    const services = serviceList.data();

    return services[service];
  }

  async setLink(user, name, fields) {
    log(`Setting ${name} for ${user.username}`);

    return database.services.doc(user.id).set(
      {
        [name]: fields,
      },
      { merge: true }
    );
  }

  async removeLink(user, serviceName) {
    log(`Removing ${serviceName} for user ${user.username}`);

    return database.services.doc(user.id).update({
      [serviceName]: Firestore.FieldValue.delete(),
    });
  }
}
