require('dotenv').config();
const mysql = require('mysql2/promise');

async function question1() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== QUESTION 1: FILTER & SORT (price >= 500,000 AND quantity > 0 ORDER BY price DESC) ===');
    
    const query = `
      SELECT id, name, price, quantity, category_id
      FROM items
      WHERE price >= ? AND quantity > ?
      ORDER BY price DESC
    `;
    const [rows] = await pool.execute(query, [500000, 0]);
    console.table(rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

question1();