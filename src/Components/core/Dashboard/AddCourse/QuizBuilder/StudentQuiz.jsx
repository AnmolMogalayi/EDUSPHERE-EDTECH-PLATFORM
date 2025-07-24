import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import logo from '../../../../../assets/Logo/Logo-Full-Light.png';
import { useSelector } from 'react-redux';

const StudentQuiz = () => {
  const { courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { course } = useSelector((state) => state.viewCourse);
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/v1/quiz/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(res.data.quiz);
        // Fetch attempt if exists
        const quizId = res.data.quiz._id;
        const attemptRes = await axios.get(`/api/v1/quiz-attempt/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (attemptRes.data.attempt) {
          setAttempt(attemptRes.data.attempt);
          setAnswers(attemptRes.data.attempt.answers || Array(res.data.quiz.questions.length).fill(null));
          if (attemptRes.data.attempt.completed) setScore(attemptRes.data.attempt.score);
        } else {
          setAnswers(Array(res.data.quiz.questions.length).fill(null));
        }
      } catch (err) {
        setError('Quiz not found or not available.');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchQuiz();
    }
  }, [courseId, token]);

  const handleAnswer = (qIdx, optIdx) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
  };

  const handleSave = async (complete = false) => {
    setSaving(true);
    setError(null);
    try {
      const res = await axios.post(
        '/api/v1/quiz-attempt/save',
        {
          quizId: quiz._id,
          courseId,
          answers,
          completed: complete,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttempt(res.data.attempt);
      if (complete) setScore(res.data.attempt.score);
    } catch (err) {
      setError('Failed to save or submit quiz.');
    } finally {
      setSaving(false);
    }
  };

  const generateCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(6);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40, 'S');

    // Logo (centered top)
    doc.addImage(logo, 'PNG', pageWidth/2 - 60, 40, 120, 60);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(44, 62, 80);
    doc.text('Certificate of Achievement', pageWidth/2, 140, { align: 'center' });

    // Subtitle
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('This is to certify that', pageWidth/2, 190, { align: 'center' });

    // Student Name
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(28);
    doc.setTextColor(30, 30, 30);
    doc.text(user?.firstName + ' ' + user?.lastName, pageWidth/2, 240, { align: 'center' });

    // For completing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.text('has successfully completed the course', pageWidth/2, 280, { align: 'center' });

    // Course Title
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    const courseTitle = course?.courseName || quiz?.courseTitle || 'Course';
    doc.text(courseTitle, pageWidth/2, 320, { align: 'center' });

    // Score
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.text('Quiz Score:', pageWidth/2, 370, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55);
    const percent = quiz && quiz.questions.length > 0 ? Math.round((score / quiz.questions.length) * 100) : 0;
    doc.text(`${score} / ${quiz?.questions.length} (${percent}%)`, pageWidth/2, 400, { align: 'center' });

    // Date
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(120, 120, 120);
    doc.text('Date: ' + new Date().toLocaleDateString(), pageWidth/2, 440, { align: 'center' });

    // Signature line
    doc.setDrawColor(100, 100, 100);
    doc.line(pageWidth/2 + 100, 500, pageWidth/2 + 250, 500);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Instructor', pageWidth/2 + 175, 520, { align: 'center' });

    // (Removed EduSphere watermark)
    // doc.setTextColor(230, 230, 230);
    // doc.setFontSize(60);
    // doc.setFont('helvetica', 'bold');
    // doc.text('EduSphere', pageWidth/2, pageHeight/2 + 100, { align: 'center', angle: 20 });

    doc.save(`Certificate-${user?.firstName || 'Student'}-${courseTitle}.pdf`);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="spinner"></div></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500 text-2xl">{error}</div>;
  if (!quiz) return <div className="flex h-screen items-center justify-center text-2xl text-richblack-5">No quiz available for this course.</div>;

  return (
    <div className="student-quiz-container bg-richblack-900 text-white min-h-screen p-4 sm:p-8">
      <div className="quiz-content max-w-4xl mx-auto bg-richblack-800 p-6 sm:p-8 rounded-xl shadow-lg border border-richblack-700 transition-all duration-300 animate-fade-in-down">
        <h2 className="text-3xl sm:text-4xl font-bold text-yellow-50 mb-6 sm:mb-8 border-b border-richblack-700 pb-4">Course Quiz</h2>
        
        {score !== null ? (
          <div className="text-center bg-richblack-700 p-8 rounded-lg animate-fade-in-up">
            <p className="text-2xl font-semibold text-richblack-5">Your Score</p>
            <p className="text-5xl font-bold text-yellow-400 my-4">{score} / {quiz.questions.length}</p>
            <p className="text-richblack-200">You have already completed this quiz.</p>
            <button
              onClick={() => navigate('/dashboard/enrolled-courses')}
              className="mt-6 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-richblack-900 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200"
            >
              Go to Courses
            </button>
            <button
              onClick={generateCertificate}
              className="mt-4 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 border border-blue-400 shadow-md"
            >
              Generate Certificate
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(true); }} className="space-y-8">
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="question-block bg-richblack-700 p-6 rounded-lg border border-richblack-600 shadow-md transition-shadow hover:shadow-xl animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="font-semibold text-xl text-richblack-5 mb-4">Q{idx + 1}: {q.question}</div>
                <div className="options grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className={`block p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${answers[idx] === oIdx ? 'bg-yellow-900 border-yellow-400' : 'bg-richblack-800 border-richblack-600 hover:border-richblack-500'}`}>
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={answers[idx] === oIdx}
                        onChange={() => handleAnswer(idx, oIdx)}
                        disabled={score !== null}
                        className="hidden"
                      />
                      <span className="text-richblack-5">{opt}</span>
                    </label>
                  ))}
                </div>
                {attempt && attempt.completed && (
                  <div className="explanation mt-4 text-sm text-green-400 p-3 bg-green-900_lighter rounded-md">
                    <span className="font-bold">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-richblack-700">
              <button 
                type="button" 
                onClick={() => handleSave(false)} 
                disabled={saving || score !== null}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-richblack-900 bg-richblack-500 hover:bg-richblack-400 transition-all duration-200 disabled:bg-richblack-600 disabled:cursor-not-allowed"
              >
                Save Progress
              </button>
              <button 
                type="submit" 
                disabled={saving || score !== null}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-richblack-900 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 disabled:bg-richblack-600 disabled:cursor-not-allowed"
              >
                {saving ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </form>
        )}
        {saving && <div className="text-center mt-4 text-yellow-300">Saving...</div>}
        {error && <div className="text-center mt-4 text-red-400 font-semibold">{error}</div>}
      </div>
    </div>
  );
};

export default StudentQuiz; 
 
 