import chalk from 'chalk';
import debug from 'debug';
import database from './index';

const log = debug('Database Setup');

export const COLLECTION_NAMES = [
  'settings',
  'guildSettings',
  'lastSeen',
  'analytics',
  'replies',
  'karma',
  'quotes',
];

// TODO: Document
export default async function createCollections() {
  log(chalk.bold('Creating Collections...'));

  try {
    const names = await database.getCollectionNames();
    const operations = [];

    COLLECTION_NAMES.forEach(async (name) => {
      if (!names.includes(name)) {
        log(`  creating '${name}'`);
        operations.push(database.createCollection(name));
      }
    });

    return Promise.all(operations);
  } catch (error) {
    // TODO: raven
    log(error);
    return new Promise((resolve, reject) => reject(error));
  }
}
