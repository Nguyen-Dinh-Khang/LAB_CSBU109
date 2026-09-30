require('dotenv').config();
const mysql = require('mysql2/promise');

async function question3() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== QUESTION 3: AGGREGATE FUNCTIONS (SUM, AVG, COUNT) ===');
    
    const query = `
      SELECT 
        COUNT(*) AS total_items,
        SUM(quantity) AS total_stock_quantity,
        ROUND(AVG(price), 2) AS average_price
      FROM items
    `;
    const [rows] = await pool.execute(query);
    console.table(rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

question3();