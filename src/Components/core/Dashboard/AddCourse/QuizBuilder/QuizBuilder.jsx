import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { quizEndpoints } from '../../../../../services/apis';
import { setStep } from '../../../../../slices/courseSlice';

const deepCloneEmptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: ''
});

const QuizBuilder = () => {
  const { courseId: courseIdFromParams } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { course } = useSelector((state) => state.course);
  const [questions, setQuestions] = useState([deepCloneEmptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const courseId = courseIdFromParams || course?._id;

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, deepCloneEmptyQuestion()]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
  const goNext = () => {
    dispatch(setStep(4));
  };

  const validateQuiz = () => {
    if (!courseId) return 'Course ID is missing.';
    if (!Array.isArray(questions) || questions.length === 0) return 'At least one question is required.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} is empty.`;
      if (!Array.isArray(q.options) || q.options.length < 2) return `Question ${i + 1} must have at least 2 options.`;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) return `Option ${j + 1} in Question ${i + 1} is empty.`;
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return `Correct answer for Question ${i + 1} is invalid.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
    try {
      const token = JSON.parse(localStorage.getItem('token'));
      if (!token) throw new Error('User not authenticated. Please log in again.');
      const res = await axios.post(
        quizEndpoints.SAVE_QUIZ_API,
        { courseId, questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Quiz saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-builder w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Quiz Builder</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-richblack-700 rounded-lg p-6 mb-4 shadow-md border border-richblack-600">
            <div className="flex justify-between items-center mb-2">
              <label className="text-lg font-semibold text-richblack-5">Question {idx + 1}</label>
              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                disabled={questions.length === 1}
                className="ml-4 px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 text-xs"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={q.question}
              onChange={e => handleQuestionChange(idx, 'question', e.target.value)}
              required
              placeholder="Enter question text"
              className="form-style w-full mb-4 bg-richblack-800 text-richblack-5 border border-richblack-600 rounded px-3 py-2"
            />
            <div className="mb-4">
              <div className="text-sm font-medium text-richblack-200 mb-2">Options</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2 bg-richblack-800 rounded px-2 py-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                      required
                      placeholder={`Option ${oIdx + 1}`}
                      className="form-style flex-1 bg-transparent text-richblack-5 border-b border-richblack-600 px-2 py-1"
                    />
                    <label className="flex items-center gap-1 text-xs text-yellow-300">
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => handleQuestionChange(idx, 'correctAnswer', oIdx)}
                        className="accent-yellow-400"
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <label className="text-sm text-richblack-200">Explanation <span className="text-xs text-richblack-400">(optional)</span></label>
              <input
                type="text"
                value={q.explanation}
                onChange={e => handleQuestionChange(idx, 'explanation', e.target.value)}
                placeholder="Add explanation for the answer (optional)"
                className="form-style w-full bg-richblack-800 text-richblack-5 border border-richblack-600 rounded px-3 py-2 mt-1"
              />
            </div>
          </div>
        ))}
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            Add Question
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 font-semibold disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Quiz'}
          </button>
          <button
              type="button"
              onClick={goNext}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
            >
              Next
            </button>
        </div>
        {success && <div className="text-green-400 font-semibold">{success}</div>}
        {error && <div className="text-pink-400 font-semibold">{error}</div>}
      </form>
    </div>
  );
};

export default QuizBuilder; 