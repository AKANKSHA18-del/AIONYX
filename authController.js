const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Unified Login (Admin & Student)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 1. Check for Admin in database
        const adminResult = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);

        if (adminResult.rows.length > 0) {
            const admin = adminResult.rows[0];
            const validPassword = await bcrypt.compare(password, admin.password);

            if (validPassword) {
                const token = jwt.sign(
                    { id: admin.id, email: admin.email, role: 'admin' },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return res.json({
                    token,
                    user: { id: admin.id, email: admin.email, role: 'admin', name: 'Admin User' }
                });
            }
        }

        // 2. Check for Student
        const studentResult = await pool.query('SELECT * FROM students WHERE email = $1', [email]);

        if (studentResult.rows.length > 0) {
            const student = studentResult.rows[0];
            const validPassword = await bcrypt.compare(password, student.password);

            if (validPassword) {
                const token = jwt.sign(
                    { id: student.id, email: student.email, role: 'student' },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return res.json({
                    token,
                    user: { id: student.id, email: student.email, role: 'student', name: student.name }
                });
            }
        }

        // 3. Failed
        return res.status(401).json({ message: 'Invalid Credentials' });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Student Signup
exports.studentSignup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if student already exists
        const existingStudent = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
        if (existingStudent.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO students (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const newStudent = result.rows[0];

        const token = jwt.sign(
            { id: newStudent.id, email: newStudent.email, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, user: { ...newStudent, role: 'student' } });

    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Student Login (alias)
exports.studentLogin = exports.login;

// Get all students (for admin dashboard with progress analysis)
exports.getStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.id, s.name, s.email, s.created_at, 
            (SELECT COUNT(*) FROM student_progress sp WHERE sp.student_id = s.id) as solved_count
            FROM students s 
            ORDER BY s.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get students error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
