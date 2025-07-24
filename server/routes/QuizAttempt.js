const express = require('express');
const router = express.Router();
const { saveQuizAttempt, getQuizAttempt } = require('../controllers/QuizAttemptController');
const { isStudent, auth } = require('../middlewares/auth');

// Save or submit quiz attempt (student only)
router.post('/save', auth, isStudent, saveQuizAttempt);

// Get quiz attempt for a user (student only)
router.get('/:quizId', auth, isStudent, getQuizAttempt);

module.exports = router; 
 
 