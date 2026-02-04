const pool = require('../config/db');

exports.getAllSections = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sections ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getQuestionsBySection = async (req, res) => {
    const { sectionId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM questions WHERE section_id = $1 ORDER BY id', [sectionId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createSection = async (req, res) => {
    const { section_name } = req.body;
    try {
        const result = await pool.query('INSERT INTO sections (section_name) VALUES ($1) RETURNING *', [section_name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Section already exists' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSection = async (req, res) => {
    const { id } = req.params;
    const { section_name } = req.body;
    try {
        const result = await pool.query('UPDATE sections SET section_name = $1 WHERE id = $2 RETURNING *', [section_name, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteSection = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM sections WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json({ message: 'Section deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createQuestion = async (req, res) => {
    const { sectionId, title, leetcodeUrl, difficulty, procedure, solution_python, solution_java, solution_cpp, timeComplexity, spaceComplexity, keyInsights } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO questions (section_id, title, leetcode_url, difficulty, procedure, solution_python, solution_java, solution_cpp, time_complexity, space_complexity, key_insights) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [sectionId, title, leetcodeUrl, difficulty, procedure, solution_python, solution_java, solution_cpp, timeComplexity, spaceComplexity, keyInsights]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { sectionId, title, leetcodeUrl, difficulty, procedure, solution_python, solution_java, solution_cpp, timeComplexity, spaceComplexity, keyInsights } = req.body;
    try {
        const result = await pool.query(
            `UPDATE questions SET section_id = $1, title = $2, leetcode_url = $3, difficulty = $4, procedure = $5, solution_python = $6, solution_java = $7, solution_cpp = $8, time_complexity = $9, space_complexity = $10, key_insights = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *`,
            [sectionId, title, leetcodeUrl, difficulty, procedure, solution_python, solution_java, solution_cpp, timeComplexity, spaceComplexity, keyInsights, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
