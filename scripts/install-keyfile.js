/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

fs.writeFile(
  path.join('packages/aquarius', process.env.FIREBASE_KEYFILE),
  process.env.FIREBASE_KEYFILE_CONTENTS,
  (error) => {
    if (error) {
      console.error('ERROR: Could not write to keyfile', error);
      process.exit(1);
    }

    console.log('Firebase credentials written to keyfile');
  }
);
