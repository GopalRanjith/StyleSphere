const mysql = require('mysql2/promise');

const isAzureHost = (process.env.DB_HOST || '').includes('.database.azure.com') || (process.env.DB_HOST || '').includes('.azure.com');
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || isAzureHost;

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password123',
    database: process.env.DB_DATABASE || 'stylesphere_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

if (useSsl) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
