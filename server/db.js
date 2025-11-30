const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.PREFICTION_DB_PATH || path.join(__dirname, 'prefiction.db');

function getDb() {
  const db = new Database(DB_PATH);
  // Ensure foreign keys on
  db.pragma('foreign_keys = ON');
  return db;
}

module.exports = { getDb, DB_PATH };
