const mysql = require('mysql');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 61000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  connectTimeout: 10000,
  acquireTimeout: 15000,
});

/**
 * Get a connection from the pool
 * @returns {Promise<mysql.PoolConnection>} A database connection
 */
function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        reject(err);
        return;
      }
      resolve(connection);
    });
  });
}

/**
 * Execute a query with proper connection management
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query results
 */
async function executeQuery(query, params = []) {
  let conn;
  try {
    conn = await getConnection();
    return new Promise((resolve, reject) => {
      conn.query(query, params, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Check if the database connection is successful
 * @returns {Promise<boolean>} True if connection is successful, otherwise false
 */
async function checkDatabaseConnection() {
  let conn;
  try {
    conn = await getConnection();
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  pool,
  executeQuery,
  checkDatabaseConnection,
};
