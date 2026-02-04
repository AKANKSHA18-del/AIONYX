const pool = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration for multi-language solutions...');

        // 1. Rename 'answer' to 'solution_python' if it exists and hasn't been renamed already
        // Check if column 'answer' exists
        const checkAnswer = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'questions' AND column_name = 'answer'
        `);

        if (checkAnswer.rows.length > 0) {
            console.log('Renaming "answer" to "solution_python"...');
            await pool.query('ALTER TABLE questions RENAME COLUMN answer TO solution_python');
        }

        // 2. Add 'solution_java' if it doesn't exist
        const checkJava = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'questions' AND column_name = 'solution_java'
        `);
        if (checkJava.rows.length === 0) {
            console.log('Adding "solution_java" column...');
            await pool.query('ALTER TABLE questions ADD COLUMN solution_java TEXT');
        }

        // 3. Add 'solution_cpp' if it doesn't exist
        const checkCpp = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'questions' AND column_name = 'solution_cpp'
        `);
        if (checkCpp.rows.length === 0) {
            console.log('Adding "solution_cpp" column...');
            await pool.query('ALTER TABLE questions ADD COLUMN solution_cpp TEXT');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
