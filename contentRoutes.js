const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const verifyToken = require('../middleware/authMiddleware');

// Public Routes
router.get('/sections', contentController.getAllSections);
router.get('/questions/:sectionId', contentController.getQuestionsBySection);

// Protected Routes (Admin Only)
router.post('/sections', verifyToken, contentController.createSection);
router.put('/sections/:id', verifyToken, contentController.updateSection);
router.delete('/sections/:id', verifyToken, contentController.deleteSection);

router.post('/questions', verifyToken, contentController.createQuestion);
router.put('/questions/:id', verifyToken, contentController.updateQuestion);
router.delete('/questions/:id', verifyToken, contentController.deleteQuestion);

module.exports = router;
