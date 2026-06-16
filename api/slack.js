// Vercel Serverless Function — Slack API proxy
// Keeps SLACK_TOKEN secret (never exposed to the browser)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.SLACK_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: 'SLACK_TOKEN not configured in Vercel environment variables' });
  }

  const { action, channel, oldest, cursor, limit } = req.query;

  let url;
  const params = new URLSearchParams();

  if (action === 'history') {
    if (!channel) return res.status(400).json({ ok: false, error: 'channel required' });
    url = 'https://slack.com/api/conversations.history';
    params.set('channel', channel);
    params.set('limit', limit || '200');
    if (oldest) params.set('oldest', oldest);
    if (cursor) params.set('cursor', cursor);
  } else if (action === 'users') {
    url = 'https://slack.com/api/users.list';
    params.set('limit', '200');
    if (cursor) params.set('cursor', cursor);
  } else {
    return res.status(400).json({ ok: false, error: 'action must be "history" or "users"' });
  }

  try {
    const r = await fetch(`${url}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    // Cache for 60s on CDN edge to avoid rate limits
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
