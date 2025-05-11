const { Database } = require('@sqlitecloud/drivers');

const db = new Database(process.env.DB_CONNECTION_STRING);

module.exports = db;
