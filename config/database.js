// Import createPool from MySQL
const { createPool } = require('mysql');
const pool = createPool({
     port: process.env.DB_PORT,
     host: process.env.DB_HOST,
     user: process.env.DB_USERNAME,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE,
     connectionLimit: process.env.DB_CONNECTION_LIMIT
});

module.exports = pool;