const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/student/signup', authController.studentSignup);
router.post('/student/login', authController.studentLogin);
router.get('/students', verifyToken, authController.getStudents);

module.exports = router;
