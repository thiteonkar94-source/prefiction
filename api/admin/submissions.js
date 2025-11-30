const connect = require('../_db');
const Submission = require('../models/Submission');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.headers['x-api-key'] || req.headers['X-API-KEY'];
  const ADMIN_KEY = process.env.ADMIN_API_KEY || 'dev-secret';
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });

  try {
    await connect();
    const rows = await Submission.find().sort({ createdAt: -1 });
    return res.json({ rows });
  } catch (err) {
    console.error('admin submissions error', err);
    return res.status(500).json({ error: 'internal server error' });
  }
};
