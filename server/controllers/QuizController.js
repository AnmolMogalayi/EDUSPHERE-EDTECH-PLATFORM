const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

// Create or update quiz for a course
exports.saveQuiz = async (req, res) => {
  try {
    const { courseId, questions } = req.body;

    // Validate required fields
    if (!courseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: courseId and questions array are required'
      });
    }

    // Validate questions format
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || 
          typeof q.correctAnswer !== 'number' || q.correctAnswer >= q.options.length) {
        return res.status(400).json({
          success: false,
          message: `Invalid question format at index ${i}. Each question must have: question text, at least 2 options, and valid correctAnswer index`
        });
      }
    }

    const userId = req.user.id;

    // Verify course exists
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let quiz = await Quiz.findOne({ courseId });
    if (quiz) {
      quiz.questions = questions;
      quiz.updatedAt = Date.now();
      await quiz.save();
    } else {
      quiz = await Quiz.create({
        courseId,
        questions,
        createdBy: userId
      });
    }

    return res.status(200).json({
      success: true,
      message: quiz ? 'Quiz updated successfully' : 'Quiz created successfully',
      quiz
    });

  } catch (err) {
    console.error('Error in saveQuiz:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save quiz. ' + (err.message || 'Unknown error occurred')
    });
  }
};

// Get quiz for a course
exports.getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required'
      });
    }

    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    return res.status(200).json({
      success: true,
      quiz
    });

  } catch (err) {
    console.error('Error in getQuizByCourse:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz. ' + (err.message || 'Unknown error occurred')
    });
  }
}; 
 
 