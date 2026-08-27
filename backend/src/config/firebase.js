const admin = require('firebase-admin');

// Initialize Firebase Admin without credentials 
// This relies purely on the project ID and is sufficient to verify ID tokens
// Since we are only validating tokens (not writing to Firestore), we don't strictly need a service account.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'adbez-advertising'
  });
}

module.exports = admin;
