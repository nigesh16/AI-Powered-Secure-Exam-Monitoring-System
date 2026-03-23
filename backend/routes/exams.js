import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import ExamRoom from '../models/ExamRoom.js';
import User from '../models/User.js';
import { protect, adminOnly, studentOnly } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = Router();

const updateExamStatus = (exam) => {
  const now = new Date();
  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  if (istNow < exam.startTime) return 'UPCOMING';
  if (istNow > exam.endTime) return 'COMPLETED';
  return 'LIVE';
};

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, date, startTime, endTime, duration, password, questions } = req.body;
    if (!title || !date || !startTime || !endTime || !duration || !password || !questions?.length) {
      return res.status(400).json({ message: 'All exam fields are required' });
    }
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const exam = await ExamRoom.createExam({
      title,
      createdBy: req.user._id,
      password,
      startTime: start,
      endTime: end,
      duration: parseInt(duration, 10),
      totalMarks,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 2,
      })),
    });
    const status = updateExamStatus(exam);
    exam.status = status;
    await exam.save();
    res.status(201).json({
      message: 'Exam created successfully',
      exam: {
        _id: exam._id,
        examId: exam.examId,
        title: exam.title,
        password,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        status: exam.status,
        totalMarks: exam.totalMarks,
        questionsCount: exam.questions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create exam' });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const exams = await ExamRoom.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('-password -students.answers -students.cheatingLogs')
      .lean();
    const now = new Date();
    for (const exam of exams) {
      if (now >= exam.startTime && now <= exam.endTime && exam.status !== 'COMPLETED') {
        exam.status = 'LIVE';
      } else if (now > exam.endTime && exam.status !== 'COMPLETED') {
        exam.status = 'COMPLETED';
        await ExamRoom.updateOne({ _id: exam._id }, { status: 'COMPLETED' });
      }
    }
    res.json({ exams });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch exams' });
  }
});

router.get('/:examId', protect, async (req, res) => {
  try {
    const exam = await ExamRoom.findOne({ examId: req.params.examId })
      .select('-password -students.answers -students.cheatingLogs -questions.correctAnswer')
      .lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const isAdmin = req.user.role === 'ADMIN' && exam.createdBy.toString() === req.user._id.toString();
    if (!isAdmin) {
      const student = exam.students?.find((s) => s.studentId?.toString() === req.user._id.toString());
      if (!student) return res.status(403).json({ message: 'Access denied' });
    }
    const status = updateExamStatus(exam);
    exam.status = status;
    if (status !== exam.status) {
      await ExamRoom.updateOne({ _id: exam._id }, { status });
    }
    res.json({
      exam: {
        ...exam,
        status,
        studentsCount: exam.students?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch exam' });
  }
});

router.post('/:examId/join', protect, studentOnly, async (req, res) => {
  try {
    const { password } = req.body;
    const exam = await ExamRoom.findOne({ examId: req.params.examId });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const valid = await exam.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid exam password' });
    const now = new Date();
    if (now < exam.startTime) return res.status(400).json({ message: 'Exam has not started yet' });
    if (now > exam.endTime) return res.status(400).json({ message: 'Exam has ended' });
    const alreadyJoined = exam.students.some((s) => s.studentId.toString() === req.user._id.toString());
    if (alreadyJoined) return res.status(400).json({ message: 'Already joined this exam' });
    exam.students.push({
      studentId: req.user._id,
      username: req.user.username,
      answers: [],
      score: 0,
      cheatingScore: 0,
      status: 'IN_PROGRESS',
      cheatImageCaptured: {},
      cheatingLogs: [],
    });
    exam.status = updateExamStatus(exam);
    await exam.save();
    res.json({
      message: 'Joined exam successfully',
      exam: {
        examId: exam.examId,
        title: exam.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        questions: exam.questions.map((q) => ({
          questionId: q.questionId,
          questionText: q.questionText,
          options: q.options,
          marks: q.marks,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to join exam' });
  }
});

router.put('/:examId/answers', protect, studentOnly, async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await ExamRoom.findOne({ examId: req.params.examId });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const student = exam.students.find((s) => s.studentId.toString() === req.user._id.toString());
    if (!student) return res.status(403).json({ message: 'Not joined this exam' });
    if (student.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Exam already submitted' });
    student.answers = answers || [];
    await exam.save();
    res.json({ message: 'Answers saved' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to save answers' });
  }
});

const CHEAT_PENALTIES = {
  TAB_SWITCH: 20,
  MOBILE_DETECTED: 20,
  MULTIPLE_PERSON: 20,
  NO_FACE: 15,
  NOT_FOCUSING: 5,
};

router.post('/:examId/cheat', protect, studentOnly, upload.single('screenshot'), async (req, res) => {
  try {
    const { eventType } = req.body;
    const exam = await ExamRoom.findOne({ examId: req.params.examId });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const student = exam.students.find((s) => s.studentId.toString() === req.user._id.toString());
    if (!student) return res.status(403).json({ message: 'Not joined this exam' });
    if (student.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Exam already submitted' });

    const penalty = CHEAT_PENALTIES[eventType] || 20;
    student.cheatingScore = Math.min(100, (student.cheatingScore || 0) + penalty);

    const key = eventType?.replace(/-/g, '_') || 'TAB_SWITCH';
    const isFirstTime = !student.cheatImageCaptured?.[key];

    if (isFirstTime) {
      if (!student.cheatImageCaptured) student.cheatImageCaptured = {};
      student.cheatImageCaptured[key] = true;
      let screenshotUrl = null;
      if (req.file?.path) {
        const normalized = req.file.path.replace(/\\/g, '/');
        const uploadsFolder = path.join(process.cwd(), 'uploads');
        const relative = path.relative(uploadsFolder, req.file.path).replace(/\\/g, '/');
        screenshotUrl = '/uploads/' + relative;
      }
      student.cheatingLogs.push({ eventType, screenshotUrl, timestamp: new Date() });
    }

    let autoSubmitted = false;
    if (student.cheatingScore >= 100) {
      const questions = exam.questions;
      let score = 0;
      for (const a of student.answers || []) {
        const q = questions.find((qu) => qu.questionId.toString() === a.questionId?.toString());
        if (q && a.selectedOption === q.correctAnswer) score += q.marks || 0;
      }
      student.score = score;
      student.status = 'CHEATING_CONFIRMED';
      autoSubmitted = true;
    }

    exam.status = updateExamStatus(exam);
    await exam.save();

    res.json({
      message: 'Cheat recorded',
      cheatingScore: student.cheatingScore,
      autoSubmitted,
      status: student.status,
      ...(autoSubmitted && { score: student.score, totalMarks: exam.totalMarks }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to record cheat' });
  }
});

router.post('/:examId/submit', protect, studentOnly, async (req, res) => {
  try {
    const exam = await ExamRoom.findOne({ examId: req.params.examId });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const student = exam.students.find((s) => s.studentId.toString() === req.user._id.toString());
    if (!student) return res.status(403).json({ message: 'Not joined this exam' });
    if (student.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Exam already submitted' });

    let score = 0;
    for (const a of student.answers || []) {
      const q = exam.questions.find((qu) => qu.questionId.toString() === a.questionId?.toString());
      if (q && a.selectedOption === q.correctAnswer) score += q.marks || 0;
    }
    student.score = score;
    student.status = 'SUBMITTED';

    exam.status = updateExamStatus(exam);
    await exam.save();

    res.json({
      message: 'Exam submitted',
      score,
      totalMarks: exam.totalMarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit exam' });
  }
});

router.get('/:examId/results', protect, adminOnly, async (req, res) => {
  try {
    const exam = await ExamRoom.findOne({ examId: req.params.examId })
      .select('examId title createdBy totalMarks status students')
      .lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const students = (exam.students || []).map((s) => ({
      studentId: s.studentId,
      username: s.username,
      score: s.score ?? 0,
      cheatingScore: s.cheatingScore ?? 0,
      status: s.status,
      cheatingLogs: s.cheatingLogs || [],
    }));
    res.json({
      examId: exam.examId,
      title: exam.title,
      totalMarks: exam.totalMarks,
      status: exam.status,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch results' });
  }
});

router.get('/:examId/student-status', protect, studentOnly, async (req, res) => {
  try {
    const exam = await ExamRoom.findOne({ examId: req.params.examId })
      .select('students questions')
      .lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const student = exam.students.find((s) => s.studentId?.toString() === req.user._id.toString());
    if (!student) return res.status(403).json({ message: 'Not joined this exam' });
    res.json({ student: { score: student.score, cheatingScore: student.cheatingScore, status: student.status } });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch status' });
  }
});

export default router;
