const crypto = require('crypto');

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  })).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token exchange failed: ' + JSON.stringify(data));
  return data.access_token;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, title, body, link } = req.body || {};
  if (!token || !title) return res.status(400).json({ error: 'Missing token or title' });

  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saRaw) return res.status(500).json({ error: 'FIREBASE_SERVICE_ACCOUNT not set' });

  let sa;
  try {
    sa = JSON.parse(saRaw);
  } catch (e) {
    return res.status(500).json({ error: 'Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ' + e.message });
  }

  try {
    const accessToken = await getAccessToken(sa);

    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body: body || '' },
            webpush: {
              notification: {
                icon: '/assets/images/logo.png',
                badge: '/assets/images/logo.png',
                dir: 'rtl',
                requireInteraction: false,
                vibrate: [200, 100, 200]
              },
              fcm_options: { link: link || '/profile.html' }
            }
          }
        })
      }
    );

    const data = await fcmRes.json();
    const statusCode = fcmRes.ok ? 200 : 400;
    return res.status(statusCode).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
};
