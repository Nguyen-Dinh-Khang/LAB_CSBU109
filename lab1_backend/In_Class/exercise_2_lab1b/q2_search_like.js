require('dotenv').config();
const mysql = require('mysql2/promise');

async function searchProductsByKeywords(pool, keywords) {
  // Tạo điều kiện (name LIKE ? OR name LIKE ? ...) linh hoạt
  const conditions = keywords.map(() => 'name LIKE ?').join(' OR ');
  const sql = `
    SELECT id, name, price, quantity 
    FROM items 
    WHERE ${conditions}
  `;
  
  // Format tham số: %keyword%
  const params = keywords.map(kw => `%${kw}%`);
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== QUESTION 2: SEARCH BY KEYWORDS ("Gaming" OR "Wireless") ===');
    const results = await searchProductsByKeywords(pool, ['Gaming', 'Wireless']);
    console.table(results);
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

run();
