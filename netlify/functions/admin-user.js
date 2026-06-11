const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://upjxnnxudukygkdgimdo.supabase.co';

  if (!serviceRoleKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body.' })
    };
  }

  const { action, userId, patch, payload: messagePayload } = payload;
  if (!action) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Action is required.' })
    };
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
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'userId and patch are required.' })
        };
      }
      const url = `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patch)
      });
      const result = await response.text();
      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: result || 'Supabase update failed.' })
        };
      }
      return {
        statusCode: 200,
        body: result || '{}'
      };
    }

    if (action === 'sendMessage') {
      if (!messagePayload || typeof messagePayload !== 'object') {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'payload is required.' })
        };
      }
      const url = `${supabaseUrl}/rest/v1/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(messagePayload)
      });
      const result = await response.text();
      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: result || 'Supabase insert failed.' })
        };
      }
      return {
        statusCode: 200,
        body: result || '{}'
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Unknown action: ${action}` })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || 'Internal server error.' })
    };
  }
};
