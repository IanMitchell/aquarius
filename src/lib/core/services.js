import debug from 'debug';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const log = debug('Services');

const SERVICE_LIST = new Map();

// TODO: Document
// TODO: Test


async function loadServiceFiles() {
  const serviceDirectory = path.join(__dirname, '../../../data/services');

  fs.readdir(serviceDirectory, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach(async (file) => {
      if (file.endsWith('.yml')) {
        log(`Loading ${file}`);

        try {
          const filePath = path.join(serviceDirectory, file);
          const { name, steps } = yaml.safeLoad(fs.readFileSync(filePath));

          SERVICE_LIST.set(name.toLowerCase(), { name, steps });
        } catch (error) {
          throw error;
        }
      }
    });
  });
}

export function getServiceNames() {
  return [...SERVICE_LIST.keys()];
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

// TODO: Implement
export async function getServiceForUser(user, serviceName) {
  return `${user.name}#${serviceName}`;
}

// eslint-disable-next-line func-names
(function () {
  loadServiceFiles();
}());
