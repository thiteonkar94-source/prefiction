const connect = require('./_db');
const Submission = require('./models/Submission');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const { name, email, company, message } = body;

  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  try {
    await connect();
    const submission = new Submission({
      name: name.trim(),
      company: company ? company.trim() : '',
      email: email.trim(),
      message: message ? message.trim() : ''
    });
    await submission.save();
    return res.status(201).json({ id: submission._id, success: true });
  } catch (err) {
    console.error('contact handler error', err);
    return res.status(500).json({ error: 'internal server error' });
  }
};
