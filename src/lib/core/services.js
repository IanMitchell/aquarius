import debug from 'debug';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import Firestore from '@google-cloud/firestore';
import database from '../database/database';

const log = debug('Services');

const SERVICE_LIST = new Map();

export async function load() {
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

        SERVICE_LIST.set(name.toLowerCase(), { name, steps });
      }
    });
  });
}

// TODO: Document
export function getServiceNames() {
  // eslint-disable-next-line no-unused-vars
  return Array.from(SERVICE_LIST.entries()).map(([key, value]) => value.name);
}

// TODO: Document
export function getServices() {
  return SERVICE_LIST;
}

// TODO: Document
export async function keys(user) {
  const serviceList = await database.services.doc(user.id).get();

  if (!serviceList.exists) {
    return [];
  }

  return Object.keys(serviceList.data());
}

// TODO: Document
export async function list(user) {
  log(`Retrieving service list for ${user.username}`);

  const serviceList = getServices();
  const serviceKeys = await keys(user);

  return serviceKeys.map(key => serviceList.get(key).name);
}

// TODO: Document
export async function has(user, service) {
  log(`Checking ${user.username} for ${service}`);

  // TODO: Can we optimize this query?
  const serviceList = await database.services.doc(user.id).get();

  if (!serviceList.exists) {
    return false;
  }

  const serviceData = serviceList.data();

  return service.toLowerCase() in serviceData;
}

// TODO: Document
export async function get(user, service) {
  log(`Retrieving ${service} for ${user.username}`);

  const serviceList = await database.services.doc(user.id).get();

  if (!serviceList.exists) {
    return null;
  }

  const serviceData = serviceList.data();

  return serviceData[service.toLowerCase()];
}

// TODO: Document
export function set(user, service, fields) {
  log(`Setting ${service} for ${user.username}`);

  return database.services.doc(user.id).set(
    {
      [service.toLowerCase()]: fields,
    },
    { merge: true }
  );
}

// TODO: Document
export function remove(user, service) {
  log(`Removing ${service} for user ${user.username}`);

  return database.services.doc(user.id).update({
    [service.toLowerCase()]: Firestore.FieldValue.delete(),
  });
}
