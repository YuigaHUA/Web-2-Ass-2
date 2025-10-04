// Database configuration and connection setup
const mysql = require('mysql2');
require('dotenv').config();

// Create database connection pool (better performance)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('💡 Please ensure:');
        console.log('   1. MySQL service is running');
        console.log('   2. Database charityevents_db is created');
        console.log('   3. Database username and password are correct');
        return;
    }
    console.log('✅ Successfully connected to MySQL database: charityevents_db');
    connection.release();
});

// Promise-based query methods
const promisePool = pool.promise();

module.exports = {
    pool,
    promisePool
};