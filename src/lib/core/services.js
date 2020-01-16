import debug from 'debug';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import Firestore from '@google-cloud/firestore';
import database from '../database';

const log = debug('Services');

const SERVICE_LIST = new Map();

// TODO: Document

async function loadServiceFiles() {
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

export function getServiceNames() {
  // eslint-disable-next-line no-unused-vars
  return Array.from(SERVICE_LIST.entries()).map(([key, value]) => value.name);
}

export function hasService(name) {
  return SERVICE_LIST.has(name);
}

export function getServiceInformation(name) {
  if (SERVICE_LIST.has(name)) {
    return SERVICE_LIST.get(name);
  }

  throw new Error('Unknown Service'); // TODO: Check Error
}

export async function getServiceKeysForUser(user) {
  const list = await database.services.doc(user.id).get();

  if (!list.exists) {
    return [];
  }

  return Object.keys(list.data());
}

export async function getServiceListForUser(user) {
  log(`Retrieving service list for ${user.username}`);

  const keys = await getServiceKeysForUser(user);
  return keys.map(key => SERVICE_LIST.get(key).name);
}

export async function getServiceForUser(user, serviceName) {
  log(`Retrieving ${serviceName} for ${user.username}`);

  const serviceList = await database.services.doc(user.id).get();

  if (!serviceList.exists) {
    return null;
  }

  const service = serviceList.data();

  return service[serviceName];
}

export async function setServiceInformationForUser(user, name, fields) {
  log(`Setting ${name} for ${user.username}`);

  return database.services.doc(user.id).set(
    {
      [name]: fields,
    },
    { merge: true }
  );
}

export async function removeServiceForUser(user, serviceName) {
  log(`Removing ${serviceName} for user ${user.username}`);

  return database.services.doc(user.id).update({
    [serviceName]: Firestore.FieldValue.delete(),
  });
}

// eslint-disable-next-line func-names
(function() {
  loadServiceFiles();
})();
