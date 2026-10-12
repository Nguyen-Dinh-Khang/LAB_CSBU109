require('dotenv').config();
const mysql = require('mysql2/promise');

async function question4() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('=== QUESTION 4: GROUP BY & HAVING (Inventory Value > 10,000,000 VND) ===');
    
    const query = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        COUNT(i.id) AS total_items,
        SUM(i.price * i.quantity) AS total_inventory_value
      FROM categories c
      INNER JOIN items i ON c.id = i.category_id
      GROUP BY c.id, c.name
      HAVING total_inventory_value > ?
      ORDER BY total_inventory_value DESC
    `;
    const [rows] = await pool.execute(query, [10000000]);
    console.table(rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

question4();
