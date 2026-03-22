import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getExam, getExamResults } from '../api';

export default function ExamDetail() {

  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();

  useEffect(() => {

    let mounted = true;

    (async () => {

      try {

        const data = await getExam(examId);

        if (mounted) setExam(data.exam);

        if (mounted && (data.exam?.status === 'COMPLETED' || data.exam?.status === 'LIVE')) {

          const res = await getExamResults(examId);

          if (mounted) setResults(res);

        }

      } catch (err) {

        if (mounted) setError(err.message);

      } finally {

        if (mounted) setLoading(false);

      }

    })();

    return () => { mounted = false };

  }, [examId]);

  const statusColor = {
    UPCOMING: 'bg-amber-100 text-amber-700',
    LIVE: 'bg-emerald-100 text-emerald-700',
    COMPLETED: 'bg-slate-200 text-slate-700',
  };

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">

        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>

      </div>

    );

  }

  if (error || !exam) {

    return (

      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FB]">

        <div className="text-center">

          <p className="text-red-600 mb-4">{error || 'Exam not found'}</p>

          <Link
            to="/admin"
            className="text-blue-600 font-medium hover:underline"
          >
            Back to Dashboard
          </Link>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#F8F9FB]">

      {/* HEADER */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            to="/admin"
            className="text-blue-600 font-medium hover:underline"
          >
            ← Back
          </Link>

          <div className="flex items-center gap-4">

            <span className="text-sm text-slate-600 font-medium">
              {user?.username}
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* MAIN */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* EXAM HEADER */}

          <div className="p-8 border-b border-slate-200">

            <h1 className="text-2xl font-bold text-slate-800">
              {exam.title}
            </h1>

            <p className="text-slate-500 mt-1">
              Exam ID: {exam.examId}
            </p>

            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                statusColor[exam.status] || 'bg-slate-200 text-slate-700'
              }`}
            >
              {exam.status}
            </span>

          </div>


          {/* STATS */}

          <div className="p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">

            <div className="bg-slate-50 rounded-xl p-5">

              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Students
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {exam.studentsCount ?? exam.students?.length ?? 0}
              </p>

            </div>

            <div className="bg-slate-50 rounded-xl p-5">

              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Questions
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {exam.questions?.length ?? 0}
              </p>

            </div>

            <div className="bg-slate-50 rounded-xl p-5">

              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Total Marks
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {exam.totalMarks ?? 0}
              </p>

            </div>

            <div className="bg-slate-50 rounded-xl p-5">

              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Duration
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {exam.duration} min
              </p>

            </div>

          </div>


          {/* RESULTS TABLE */}

          {(exam.status === 'COMPLETED' || exam.status === 'LIVE') && results?.students?.length > 0 && (

            <div className="p-8 border-t border-slate-200">

              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                Student Results
              </h2>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b border-slate-200 text-left text-slate-600">

                      <th className="py-3 px-2">Student</th>

                      <th className="py-3 px-2">Score</th>

                      <th className="py-3 px-2">Status</th>

                      <th className="py-3 px-2">Cheating Score</th>

                      <th className="py-3 px-2">Screenshots</th>

                    </tr>

                  </thead>

                  <tbody>

                    {results.students.map((s) => (

                      <tr
                        key={s.studentId}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="py-3 px-2 font-medium">
                          {s.username}
                        </td>

                        <td className="py-3 px-2">
                          {s.score} / {results.totalMarks}
                        </td>

                        <td className="py-3 px-2">

                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              s.status === 'CHEATING_CONFIRMED'
                                ? 'bg-red-100 text-red-700'
                                : s.status === 'SUBMITTED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {s.status}
                          </span>

                        </td>

                        <td className="py-3 px-2">
                          {s.cheatingScore}
                        </td>

                        <td className="py-3 px-2">

                          {s.cheatingLogs?.length > 0 ? (

                            <div className="flex flex-wrap gap-2">

                              {s.cheatingLogs.map((log, i) => (

                                <a
                                  key={i}
                                  href={log.screenshotUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block"
                                >

                                  {log.screenshotUrl ? (

                                    <img
                                      src={log.screenshotUrl}
                                      alt={log.eventType}
                                      className="w-14 h-14 object-cover rounded border border-slate-200 group-hover:border-blue-500"
                                    />

                                  ) : (

                                    <span className="text-xs text-slate-500">
                                      {log.eventType}
                                    </span>

                                  )}

                                </a>

                              ))}

                            </div>

                          ) : (

                            <span className="text-slate-400">—</span>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>

  );

}