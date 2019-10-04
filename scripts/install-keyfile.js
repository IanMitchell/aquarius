const fs = require('fs');

const secret = Buffer.from(
  process.env.FIREBASE_KEYFILE_CONTENTS,
  'base64'
).toString();

fs.writeFile(process.env.FIREBASE_KEYFILE, secret, error => {
  if (error) {
    console.error('ERROR: Could not write to keyfile', error);
    process.exit(1);
  }

  console.log('Firebase credentials written to keyfile');
});
