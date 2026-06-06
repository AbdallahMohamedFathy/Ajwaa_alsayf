const webpush = require('web-push');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subscription, title, body, link } = req.body || {};
  if (!subscription || !title) return res.status(400).json({ error: 'Missing subscription or title' });

  const publicKey  = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return res.status(500).json({ error: 'VAPID keys not set' });

  webpush.setVapidDetails('mailto:ajwaaelsaif@admin.com', publicKey, privateKey);

  try {
    await webpush.sendNotification(
      typeof subscription === 'string' ? JSON.parse(subscription) : subscription,
      JSON.stringify({ title, body: body || '', link: link || '/' })
    );
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
