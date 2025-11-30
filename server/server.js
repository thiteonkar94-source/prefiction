require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const path = require('path');

const app = express();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.warn('WARNING: MONGODB_URI environment variable not set. Database connection will fail.');
}
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
const port = process.env.PORT || 3000;

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('tiny'));

// Serve project static files (for local development). This lets you open the site via the server
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

// Also serve admin.html from server folder
app.use(express.static(path.join(__dirname)));

// Simple health check
app.get('/_health', (req, res) => res.send({ ok: true }));

// POST endpoint to receive contact form submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, company, message } = req.body || {};

  if (!email || !name) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  try {
    const submission = new Submission({
      name: name.trim(),
      company: company ? company.trim() : '',
      email: email.trim(),
      message: message ? message.trim() : ''
    });
    await submission.save();
    res.status(201).json({ id: submission._id, success: true });
  } catch (err) {
    console.error('DB insert failed', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// Basic admin endpoint to list submissions. Protect with a simple header key.
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'dev-secret';
app.get('/admin/submissions', async (req, res) => {
  const key = req.get('x-api-key');
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });

  try {
    const rows = await Submission.find().sort({ createdAt: -1 });
    res.json({ rows });
  } catch (err) {
    console.error('DB read failed', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// Serve admin.html explicitly at /admin.html (some hosts may not expose server folder statically)
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
  console.log(`Prefiction server listening on http://localhost:${port}`);
  console.log(`Serving static files from ${staticRoot}`);
});
