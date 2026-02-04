const pool = require('../config/db');

// Mark a question as solved
exports.markQuestionSolved = async (req, res) => {
    const { studentId, questionId } = req.body;

    try {
        // Check if already solved to prevent duplicates (though UNIQUE constraint handles this, good to be explicit/safe)
        const check = await pool.query(
            'SELECT * FROM student_progress WHERE student_id = $1 AND question_id = $2',
            [studentId, questionId]
        );

        if (check.rows.length > 0) {
            return res.status(200).json({ message: 'Already marked as solved' });
        }

        await pool.query(
            'INSERT INTO student_progress (student_id, question_id) VALUES ($1, $2)',
            [studentId, questionId]
        );

        res.status(201).json({ message: 'Question marked as solved' });
    } catch (err) {
        console.error('Error marking question solved:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all solved questions for a student
exports.getSolvedQuestions = async (req, res) => {
    // We can get studentId from the token (req.user) if we use middleware, 
    // or pass it as a param. Let's assume we use the authenticated user's ID.
    const studentId = req.params.studentId;

    try {
        const result = await pool.query(
            'SELECT question_id, completed_at FROM student_progress WHERE student_id = $1',
            [studentId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching progress:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
