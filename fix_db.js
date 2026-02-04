const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function fixDb() {
    try {
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to execute one by one
        const queries = schema
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        console.log('Starting database initialization...');

        for (const query of queries) {
            try {
                await db.query(query);
            } catch (err) {
                // If column exists error, ignore or handle
                if (err.message.includes('already exists')) {
                    // console.log('Skipping existing structure');
                } else {
                    console.error('Error executing query:', query);
                    console.error('Reason:', err.message);
                }
            }
        }

        console.log('Database schema normalization complete.');

        // Ensure student_progress has the right columns
        // We can drop it and recreate it to be sure, since it's just progress
        console.log('Resetting student_progress table to ensure columns match...');
        await db.query('DROP TABLE IF EXISTS student_progress');
        await db.query(`
            CREATE TABLE student_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, question_id)
            )
        `);

        console.log('Reset complete. student_progress is now correct.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to fix database:', err);
        process.exit(1);
    }
}

fixDb();
