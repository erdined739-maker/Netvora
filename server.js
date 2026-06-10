const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const defaultFirebaseConfig = {
  apiKey: "AIzaSyCxXRmg2aMYXD90bi6FZgKlc-WOz4ZE9Gg",
  authDomain: "netvora-838ee.firebaseapp.com",
  projectId: "netvora-838ee",
  storageBucket: "netvora-838ee.firebasestorage.app",
  messagingSenderId: "107956835981",
  appId: "1:107956835981:web:7a008de3ede40048b334c4"
};

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Supabase config endpoint (güvenli şekilde frontend'e verir)
app.get('/supabase-config', (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || ""
  });
});

// Firebase config endpoint (yalnızca public parametreleri döner)
// Beklenen env isimleri: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
// FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
app.get('/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
    projectId: process.env.FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
    appId: process.env.FIREBASE_APP_ID || defaultFirebaseConfig.appId
  });
});


// Fallback to index.html for Single Page App routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  NETVORA Local Server running on port ${PORT}`);
  console.log(`  Access the website at: http://localhost:${PORT}`);
  console.log(`  AI calls go directly to Supabase Edge Function`);
  console.log(`==================================================`);
});
