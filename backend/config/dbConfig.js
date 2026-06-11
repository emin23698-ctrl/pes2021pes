const { Pool, types } = require('pg');
require('dotenv').config();

// PostgreSQL'den gelen DATE tipindeki verilerin 1 gün geri atma problemini çözer
types.setTypeParser(1082, function(stringValue) {
  return stringValue; 
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('Neon PostgreSQL veritabanına başarıyla bağlanıldı.');
});

pool.on('error', (err) => {
  console.error('Veritabanı bağlantı hatası:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};