const { Pool } = require('pg');

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
});

module.exports = pool;
