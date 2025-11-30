const mongoose = require('mongoose');

// Cached connection across lambda invocations
const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connect() {
  if (cached.conn) return cached.conn;
  const uri = process.env.mongodb_uri || process.env.MONGODB_URI;
  if (!uri) throw new Error('mongodb_uri or MONGODB_URI not set');
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then((m) => {
      cached.conn = m;
      return m;
    });
  }
  await cached.promise;
  return cached.conn;
}

module.exports = connect;
