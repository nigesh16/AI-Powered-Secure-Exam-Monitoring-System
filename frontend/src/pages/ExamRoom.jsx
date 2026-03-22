import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveAnswers, reportCheat, submitExam, analyzeFrame, getExam } from '../api';

const CHEAT_EVENTS = {
  MULTIPLE_PERSON: 'MULTIPLE_PERSON',
  MOBILE_DETECTED: 'MOBILE_DETECTED',
  NO_FACE: 'NO_FACE',
  NOT_FOCUSING: 'NOT_FOCUSING',
  TAB_SWITCH: 'TAB_SWITCH',
};

export default function ExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [cheatingScore, setCheatingScore] = useState(0);
  const [status, setStatus] = useState('IN_PROGRESS');
  const [cameraError, setCameraError] = useState('');
  const [warning, setWarning] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const lastTabVisibleRef = useRef(true);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraError('');
    } catch (err) {
      setCameraError('Camera access denied. Please enable camera to take the exam.');
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || status !== 'IN_PROGRESS') return null;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }, [status]);

  const captureFrameAsBlob = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || status !== 'IN_PROGRESS') return null;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  }, [status]);

  const reportCheatEvent = useCallback(
    async (eventType, screenshotBlob = null) => {
      if (status !== 'IN_PROGRESS') return;
      try {
        const data = await reportCheat(examId, eventType, screenshotBlob);
        setCheatingScore(data.cheatingScore ?? cheatingScore + 20);
        if (data.autoSubmitted) {
          setStatus('CHEATING_CONFIRMED');
          setResult({ score: data.score ?? 0, totalMarks: data.totalMarks ?? exam?.totalMarks ?? 0 });
          setSubmitted(true);
          stopCamera();
        }
      } catch (err) {
        console.error('Failed to report cheat:', err);
      }
    },
    [examId, status, cheatingScore, exam?.totalMarks, stopCamera]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const joinRes = await getExam(examId);
        if (mounted && joinRes.exam) {
          const ex = joinRes.exam;
          setExam(ex);
          setTimeLeft((ex.duration || 60) * 60);
          setAnswers(ex.questions?.map((q) => ({ questionId: q.questionId, selectedOption: -1 })) || []);
        }
      } catch (err) {
        if (mounted) navigate('/student');
      }
    })();
    return () => { mounted = false; };
  }, [examId, navigate]);

  useEffect(() => {
    if (!exam) return;
    startCamera();
    return () => stopCamera();
  }, [exam, startCamera, stopCamera]);

  useEffect(() => {
    if (timeLeft === null || status !== 'IN_PROGRESS') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, status]);

  useEffect(() => {
    if (timeLeft === 0 && status === 'IN_PROGRESS' && !submitted) {
      (async () => {
        try {
          const data = await submitExam(examId);
          setResult({ score: data.score, totalMarks: data.totalMarks });
          setStatus('SUBMITTED');
          setSubmitted(true);
          stopCamera();
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [timeLeft, status, submitted, examId, stopCamera]);

  useEffect(() => {
    if (status !== 'IN_PROGRESS' || !exam) return;
    const runAnalysis = async () => {
      const base64 = captureFrame();
      if (!base64) return;
      try {
        const res = await analyzeFrame(base64);
        const blob = await captureFrameAsBlob();
        if (res.multiplePerson) await reportCheatEvent(CHEAT_EVENTS.MULTIPLE_PERSON, blob);
        if (res.mobileDetected) await reportCheatEvent(CHEAT_EVENTS.MOBILE_DETECTED, blob);
        if (res.noFace) await reportCheatEvent(CHEAT_EVENTS.NO_FACE, blob);
        if (res.notFocusing) await reportCheatEvent(CHEAT_EVENTS.NOT_FOCUSING, blob);
      } catch (err) {
        console.error('AI analysis error:', err);
      }
    };
    analysisIntervalRef.current = setInterval(runAnalysis, 3000);
    return () => clearInterval(analysisIntervalRef.current);
  }, [status, exam, captureFrame, captureFrameAsBlob, reportCheatEvent]);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden && lastTabVisibleRef.current && status === 'IN_PROGRESS') {
        lastTabVisibleRef.current = false;
        setWarning('Tab switch detected!');
        const blob = await captureFrameAsBlob();
        reportCheatEvent(CHEAT_EVENTS.TAB_SWITCH, blob);
      }
      if (!document.hidden) lastTabVisibleRef.current = true;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, reportCheatEvent, captureFrameAsBlob]);

  useEffect(() => {
    const save = () => {
      if (answers.length && status === 'IN_PROGRESS') {
        const toSave = answers.filter((a) => a.selectedOption >= 0);
        if (toSave.length) saveAnswers(examId, toSave).catch(() => {});
      }
    };
    const id = setInterval(save, 10000);
    return () => clearInterval(id);
  }, [answers, status, examId]);

  const handleAnswer = (questionId, selectedOption) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, selectedOption } : a
      )
    );
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ✅ SUBMIT FUNCTION ADDED
  const handleSubmit = () => {
    const confirmSubmit = window.confirm("Are you sure you want to submit?");
    if (!confirmSubmit) return;

    setSubmitted(true);
    setStatus('SUBMITTED');

    alert("Exam submitted successfully!");

    stopCamera();
    navigate('/student');
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {status === 'CHEATING_CONFIRMED' ? 'Exam Terminated' : 'Exam Submitted'}
          </h2>
          <p className="text-slate-600 mb-2">
            Score: {result.score} / {result.totalMarks}
          </p>
          <button
            onClick={() => navigate('/student')}
            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const questions = exam.questions || [];
  const current = questions[currentQ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-slate-800 truncate">{exam.title}</h1>
          <div className="flex items-center gap-4">
            <span className={`font-mono font-semibold ${timeLeft <= 300 ? 'text-red-600' : 'text-slate-700'}`}>
              {formatTime(timeLeft ?? 0)}
            </span>
            <span className="text-sm text-slate-600">
              Cheating: {cheatingScore}/100
            </span>
          </div>
        </div>
        {warning && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-center text-sm">
            {warning}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
            {current && (
              <>
                <h2 className="font-semibold text-slate-800 mb-4">
                  Question {currentQ + 1} of {questions.length}
                </h2>
                <p className="text-slate-700 mb-4">{current.questionText}</p>
                <div className="space-y-3">
                  {current.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers.find((a) => a.questionId === current.questionId)?.selectedOption === i
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-primary-300'
                    }`}>
                      <input
                        type="radio"
                        name={`q-${current.questionId}`}
                        checked={answers.find((a) => a.questionId === current.questionId)?.selectedOption === i}
                        onChange={() => handleAnswer(current.questionId, i)}
                        className="sr-only"
                      />
                      <span className="flex-1">{opt}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-10 h-10 rounded-lg font-medium ${
                  currentQ === i
                    ? 'bg-primary-600 text-white'
                    : answers.find((a) => a.questionId === q.questionId)?.selectedOption >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* ✅ SUBMIT BUTTON */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold w-full"
            >
              Submit Exam
            </button>
          </div>

        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sticky top-24">
            <h3 className="font-semibold text-slate-800 mb-3">Camera</h3>
            {cameraError ? (
              <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-red-600 text-sm text-center p-4">
                {cameraError}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video rounded-lg bg-slate-900 object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </main>
    </div>
  );
}
