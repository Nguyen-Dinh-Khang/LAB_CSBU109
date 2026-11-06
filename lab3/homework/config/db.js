const mysql = require("mysql2/promise")
require("dotenv").config()


const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce_order_db",
    port: process.env.DB_PORT || "3306",
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});


async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(" MySQL connected successfully to " + process.env.DB_NAME);
        connection.release();
    } catch (error) {
        console.log(" MySQL connection failed: " + error.message);
    }
}

testConnection()

module.exports = pool;