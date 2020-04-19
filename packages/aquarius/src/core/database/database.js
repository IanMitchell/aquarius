import Sentry from '@aquarius/sentry';
import Firestore from '@google-cloud/firestore';
import debug from 'debug';
import path from 'path';
import { getDirname } from '../helpers/files';

const log = debug('Database');

function isValidCollectionName(name) {
  return typeof name === 'string' && name;
}

/**
 * @type {Firestore}
 */
const database = (() => {
  log('Connecting to Firebase...');

  try {
    const firestore = new Firestore({
      projectId: process.env.FIREBASE_PROJECT,
      keyFilename: path.join(
        getDirname(import.meta.url),
        `../../../${process.env.FIREBASE_KEYFILE}`
      ),
    });

    const methods = Object.create(null);

    // Inspired my Mongoist
    return new Proxy(firestore, {
      get: (obj, prop) => {
        const fbProp = obj[prop];

        // Cache, lazily
        if (typeof fbProp === 'function') {
          methods[prop] = methods[prop] || fbProp.bind(firestore);
          return methods[prop];
        }

        if (isValidCollectionName(prop)) {
          return firestore.collection(prop);
        }

        return fbProp;
      },
    });
  } catch (error) {
    log('Database failed to initialize!');
    log(error);
    Sentry.captureException(error);
  }

  return null;
})();

export default database;
