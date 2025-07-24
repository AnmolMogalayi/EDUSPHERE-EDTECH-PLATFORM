const express = require('express');
const router = express.Router();
const { saveQuiz, getQuizByCourse } = require('../controllers/QuizController');
const { isInstructor, auth } = require('../middlewares/auth');

// Save or update quiz (instructor only)
router.post('/save', auth, isInstructor, saveQuiz);

// Get quiz by courseId (students and instructors)
router.get('/:courseId', auth, getQuizByCourse);

module.exports = router; 
 
 