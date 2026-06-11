exports.handler = async function(event, context) {
  const defaultFirebaseConfig = {
    apiKey: "AIzaSyCxXRmg2aMYXD90bi6FZgKlc-WOz4ZE9Gg",
    authDomain: "netvora-838ee.firebaseapp.com",
    projectId: "netvora-838ee",
    storageBucket: "netvora-838ee.firebasestorage.app",
    messagingSenderId: "107956835981",
    appId: "1:107956835981:web:7a008de3ede40048b334c4"
  };

  const response = {
    apiKey: process.env.FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
    projectId: process.env.FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
    appId: process.env.FIREBASE_APP_ID || defaultFirebaseConfig.appId
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(response)
  };
};
