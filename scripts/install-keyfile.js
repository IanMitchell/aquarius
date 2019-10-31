const fs = require('fs');

fs.writeFile(
  process.env.FIREBASE_KEYFILE,
  process.env.FIREBASE_KEYFILE_CONTENTS,
  error => {
    if (error) {
      console.error('ERROR: Could not write to keyfile', error);
      process.exit(1);
    }

    console.log('Firebase credentials written to keyfile');
  }
);
