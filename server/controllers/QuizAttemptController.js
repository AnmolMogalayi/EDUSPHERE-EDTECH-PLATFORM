const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// Submit or save quiz attempt
exports.saveQuizAttempt = async (req, res) => {
  try {
    const { quizId, courseId, answers, completed } = req.body;
    const userId = req.user.id;
    let attempt = await QuizAttempt.findOne({ userId, quizId });
    let score = 0;
    if (completed) {
      const quiz = await Quiz.findById(quizId);
      if (quiz) {
        score = answers.reduce((acc, ans, idx) => acc + (ans === quiz.questions[idx].correctAnswer ? 1 : 0), 0);
      }
    }
    if (attempt) {
      attempt.answers = answers;
      attempt.completed = completed;
      attempt.score = score;
      if (completed) attempt.completedAt = Date.now();
      await attempt.save();
    } else {
      attempt = await QuizAttempt.create({ userId, courseId, quizId, answers, completed, score, completedAt: completed ? Date.now() : undefined });
    }
    return res.status(200).json({ success: true, attempt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get quiz attempt for a user
exports.getQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const attempt = await QuizAttempt.findOne({ userId, quizId });
    if (!attempt) {
      return res.status(200).json({ success: true, attempt: null });
    }
    return res.status(200).json({ success: true, attempt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}; 
 
 