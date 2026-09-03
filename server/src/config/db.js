// StyleSphere Universal Database Connector
// Supports both Azure SQL Database (mssql) and MySQL (mysql2) seamlessly.

const isAzureSql = (process.env.DB_HOST || '').includes('.database.windows.net') || 
                   (process.env.DB_SERVER || '').includes('.database.windows.net') ||
                   process.env.DB_TYPE === 'mssql';

let db = {};

if (isAzureSql) {
    const sql = require('mssql');
    const serverHost = (process.env.DB_HOST || process.env.DB_SERVER || 'stylespheresqlranjith.database.windows.net')
        .replace(':1433', '');

    const config = {
        user: process.env.DB_USER || 'stylesphereadmin',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password123',
        server: serverHost,
        database: process.env.DB_DATABASE || 'stylesphere_db',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        options: {
            encrypt: true,
            trustServerCertificate: false
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };

    const poolPromise = sql.connect(config);

    async function executeQuery(query, params = [], activeRequest = null) {
        let pIndex = 0;
        let transformedSql = query;
        
        // Transform `?` into `@p0`, `@p1`, ...
        transformedSql = transformedSql.replace(/\?/g, () => `@p${pIndex++}`);

        // Dialect cleanup for double/float
        transformedSql = transformedSql.replace(/AS\s+DOUBLE/gi, 'AS FLOAT');

        // Check if query is an INSERT
        const isInsert = /^\s*INSERT\s+INTO/i.test(transformedSql);
        if (isInsert && !/OUTPUT\s+INSERTED/i.test(transformedSql) && !/SCOPE_IDENTITY/i.test(transformedSql)) {
            transformedSql += '; SELECT SCOPE_IDENTITY() AS insertId;';
        }

        const p = await poolPromise;
        const request = activeRequest || p.request();
        
        params.forEach((val, i) => {
            request.input(`p${i}`, val);
        });

        const result = await request.query(transformedSql);
        
        if (isInsert) {
            const insertId = result.recordset?.[0]?.insertId || 0;
            return [{ insertId, affectedRows: result.rowsAffected?.[0] || 1 }];
        }

        return [result.recordset || []];
    }

    db.execute = (query, params) => executeQuery(query, params);
    db.query = (query, params) => executeQuery(query, params);

    db.getConnection = async () => {
        const p = await poolPromise;
        const transaction = new sql.Transaction(p);
        let inTransaction = false;

        return {
            beginTransaction: async () => {
                await transaction.begin();
                inTransaction = true;
            },
            execute: async (query, params) => {
                const request = new sql.Request(transaction);
                return executeQuery(query, params, request);
            },
            query: async (query, params) => {
                const request = new sql.Request(transaction);
                return executeQuery(query, params, request);
            },
            commit: async () => {
                if (inTransaction) {
                    await transaction.commit();
                    inTransaction = false;
                }
            },
            rollback: async () => {
                if (inTransaction) {
                    await transaction.rollback();
                    inTransaction = false;
                }
            },
            release: () => {}
        };
    };
} else {
    // MySQL 8.0+ Connection Pool
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
    db = pool;
}

module.exports = db;
