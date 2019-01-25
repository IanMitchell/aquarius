import path from 'path';
import debug from 'debug';
import Firestore from '@google-cloud/firestore';

const log = debug('Database');

function isValidCollectionName(name) {
  return typeof name === 'string' && name;
}

const database = (() => {
  log('Connecting to Firebase...');

  const firestore = new Firestore({
    projectId: process.env.FIREBASE_PROJECT,
    keyFilename: path.join(__dirname, `../../../${process.env.FIREBASE_KEYFILE}`),
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
})();

export default database;
