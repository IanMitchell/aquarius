const firebase = require('firebase');

// Initialize the app with a service account, granting admin privileges
firebase.initializeApp({
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com/`,
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
});

const db = firebase.database();
const ref = db.ref('aquarius');

module.exports = ref;
