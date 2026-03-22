import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createExam } from '../api';

const defaultQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  marks: 2,
});

export default function CreateExam() {

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [password, setPassword] = useState('');
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const updateQuestion = (idx, field, value) => {
    const next = [...questions];

    if (field === 'options') {
      next[idx].options = value;
    } else {
      next[idx][field] = value;
    }

    setQuestions(next);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const calculateDuration = () => {

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    const diff = (end - start) / (1000 * 60);

    return diff;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    const valid = questions.every(
      (q) => q.questionText.trim() && q.options.every((o) => o.trim())
    );

    if (!valid) {
      setError('All questions must have text and 4 options.');
      return;
    }

    const duration = calculateDuration();

    if (duration <= 0) {
      setError('End time must be greater than start time.');
      return;
    }

    setLoading(true);

    try {

      const data = await createExam({
        title,
        date,
        startTime,
        endTime,
        duration,
        password,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: parseInt(q.correctAnswer, 10),
          marks: q.marks || 2,
        })),
      });

      setSuccess(data);

      setTimeout(() => navigate('/admin'), 3000);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  if (success) {

    return (

      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

          <h2 className="text-xl font-bold text-emerald-700 mb-4">
            Exam Created Successfully
          </h2>

          <p className="text-slate-600 mb-4">
            Share these details with students
          </p>

          <div className="bg-slate-50 rounded-xl p-5 space-y-2 text-left">

            <p>
              <strong>Exam ID:</strong> {success.exam?.examId}
            </p>

            <p>
              <strong>Password:</strong> {success.exam?.password}
            </p>

          </div>

          <Link
            to="/admin"
            className="mt-6 inline-block text-blue-600 font-medium hover:underline"
          >
            Back to Dashboard
          </Link>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#F8F9FB] py-10">

      <div className="max-w-4xl mx-auto px-6">

        <Link
          to="/admin"
          className="text-blue-600 font-medium hover:underline mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-8">
          Create New Exam
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BASIC INFO */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">

            <h2 className="font-semibold text-slate-800">
              Basic Information
            </h2>

            <div>

              <label className="block text-sm text-slate-600 mb-1">
                Exam Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Data Structures Test"
              />

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div>

                <label className="block text-sm text-slate-600 mb-1">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300"
                />

              </div>

              <div>

                <label className="block text-sm text-slate-600 mb-1">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300"
                />

              </div>

              <div>

                <label className="block text-sm text-slate-600 mb-1">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300"
                />

              </div>

            </div>

            <div>

              <label className="block text-sm text-slate-600 mb-1">
                Exam Password
              </label>

              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-300"
                placeholder="exam123"
              />

            </div>

          </div>

          {/* QUESTIONS */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="font-semibold text-slate-800">
                MCQ Questions
              </h2>

              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                + Add Question
              </button>

            </div>

            <div className="space-y-6">

              {questions.map((q, idx) => (

                <div
                  key={idx}
                  className="p-5 bg-slate-50 rounded-xl space-y-4"
                >

                  <div className="flex justify-between">

                    <span className="text-sm font-medium text-slate-600">
                      Question {idx + 1}
                    </span>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}

                  </div>

                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300"
                    placeholder="Enter question text"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {q.options.map((opt, oi) => (

                      <input
                        key={oi}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...q.options];
                          opts[oi] = e.target.value;
                          updateQuestion(idx, 'options', opts);
                        }}
                        required
                        className="px-3 py-2 rounded border border-slate-300 text-sm"
                        placeholder={`Option ${oi + 1}`}
                      />

                    ))}

                  </div>

                  <div className="flex gap-6">

                    <label className="text-sm">

                      Correct Answer

                      <select
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded"
                      >

                        {[0, 1, 2, 3].map((i) => (
                          <option key={i} value={i}>
                            {i + 1}
                          </option>
                        ))}

                      </select>

                    </label>

                    <label className="text-sm">

                      Marks

                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(idx, 'marks', parseInt(e.target.value, 10) || 2)
                        }
                        min={1}
                        className="ml-2 w-16 px-2 py-1 border rounded"
                      />

                    </label>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Exam...' : 'Create Exam'}
          </button>

        </form>

      </div>

    </div>

  );

}