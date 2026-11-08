const { Pool, types } = require("pg");

// Parse PostgreSQL DATE type (OID 1082) as plain string 'YYYY-MM-DD' apa adanya
// Mencegah node-pg mengonversi DATE ke JavaScript Date UTC yang menggeser tanggal mundur 1 hari di zona waktu Indonesia (WIB UTC+7)
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "db_jdih",
});

pool.on("connect", () => {
    
});

pool.on("error", (err) => {
    
});

module.exports = pool;