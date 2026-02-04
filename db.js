require('dotenv').config();
const { Pool } = require("pg");

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // required for Neon
    },
});

// Test connection once
pool.query("SELECT 1")
    .then(() => console.log("✅ Connected to Neon PostgreSQL"))
    .catch(err => console.error("❌ Neon DB connection error:", err));

module.exports = {
    query: async (text, params = []) => {
        try {
            const result = await pool.query(text, params);
            return {
                rows: result.rows || [],
                rowCount: result.rowCount || 0,
            };
        } catch (err) {
            console.error("DB Query Error:", err);
            throw err;
        }
    }
};
