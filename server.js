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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/supabase-config', (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || ""
  });
});

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

const adminUserHandler = async (req, res) => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://upjxnnxudukygkdgimdo.supabase.co';

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required.' });
  }

  const { action, userId, patch, payload } = req.body || {};
  if (!action) {
    return res.status(400).json({ error: 'Action is required.' });
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  try {
    if (action === 'updateUser') {
      if (!userId || !patch || typeof patch !== 'object') {
        return res.status(400).json({ error: 'userId and patch are required.' });
      }

      const url = `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patch)
      });
      const body = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ error: body || 'Supabase update failed.' });
      }
      return res.status(200).send(body || '{}');
    }

    if (action === 'sendMessage') {
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'payload is required.' });
      }

      const url = `${supabaseUrl}/rest/v1/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const body = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ error: body || 'Supabase insert failed.' });
      }
      return res.status(200).send(body || '{}');
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e) {
    console.warn('admin-user function error:', e);
    return res.status(500).json({ error: e.message || 'Internal error' });
  }
};

app.post('/.netlify/functions/admin-user', adminUserHandler);
app.post('/admin-user', adminUserHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
