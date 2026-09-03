// StyleSphere: Automated Azure MySQL Flexible Server Migration Tool
// Usage:
//   node database/migrate-to-azure.js
// Or with custom env:
//   AZURE_DB_HOST=myserver.mysql.database.azure.com AZURE_DB_USER=myuser AZURE_DB_PASSWORD=mypass node database/migrate-to-azure.js

const fs = require('fs');
const path = require('path');
let mysql;
try {
    mysql = require('mysql2/promise');
} catch {
    mysql = require(path.join(__dirname, '..', 'server', 'node_modules', 'mysql2', 'promise'));
}

async function migrate() {
    console.log('====================================================');
    console.log('  StyleSphere: Azure MySQL Migration Script');
    console.log('====================================================\n');

    const host = process.env.AZURE_DB_HOST || process.env.DB_HOST || 'localhost';
    const user = process.env.AZURE_DB_USER || process.env.DB_USER || 'root';
    const password = process.env.AZURE_DB_PASSWORD || process.env.DB_PASSWORD || '';
    const port = parseInt(process.env.AZURE_DB_PORT || process.env.DB_PORT || '3306', 10);
    const database = process.env.AZURE_DB_DATABASE || process.env.DB_DATABASE || 'stylesphere_db';
    const isAzure = host.includes('.database.azure.com') || host.includes('.azure.com');

    console.log(`Target Host:     ${host}`);
    console.log(`Target Port:     ${port}`);
    console.log(`Target User:     ${user}`);
    console.log(`Target Database: ${database}`);
    console.log(`SSL Mode:        ${isAzure ? 'Required (Azure Flexible Server)' : 'Disabled / Auto'}\n`);

    const connectionConfig = {
        host,
        user,
        password,
        port,
        multipleStatements: true,
        connectTimeout: 30000
    };

    if (isAzure || process.env.DB_SSL === 'true') {
        connectionConfig.ssl = { rejectUnauthorized: false };
    }

    let conn;
    try {
        console.log('[1/4] Connecting to target MySQL server...');
        conn = await mysql.createConnection(connectionConfig);
        console.log('      Connected successfully!\n');

        console.log('[2/4] Reading migration schema file...');
        const migrationSqlPath = path.join(__dirname, 'azure_migration.sql');
        if (!fs.existsSync(migrationSqlPath)) {
            throw new Error(`Migration SQL file not found at: ${migrationSqlPath}`);
        }
        const sqlContent = fs.readFileSync(migrationSqlPath, 'utf8');
        console.log(`      Loaded ${Math.round(sqlContent.length / 1024)} KB of DDL & Seed SQL.\n`);

        console.log('[3/4] Executing schema creation & data seeding...');
        await conn.query(sqlContent);
        console.log('      All tables and seed data created successfully!\n');

        console.log('[4/4] Verifying migrated tables & counts:');
        await conn.changeUser({ database });
        
        const [tables] = await conn.query('SHOW TABLES;');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(`      Found ${tableNames.length} tables: ${tableNames.join(', ')}`);

        const [productCount] = await conn.query('SELECT COUNT(*) AS count FROM products;');
        const [userCount] = await conn.query('SELECT COUNT(*) AS count FROM users;');
        const [catCount] = await conn.query('SELECT COUNT(*) AS count FROM categories;');

        console.log(`      - Products seeded:   ${productCount[0].count}`);
        console.log(`      - Users seeded:      ${userCount[0].count}`);
        console.log(`      - Categories seeded: ${catCount[0].count}\n`);

        console.log('====================================================');
        console.log('  MIGRATION COMPLETED SUCCESSFULLY! READY FOR AZURE.');
        console.log('====================================================');
    } catch (err) {
        console.error('\n[ERROR] Migration failed:');
        console.error(err.message);
        process.exitCode = 1;
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

migrate();
