import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    marks: { type: Number, required: true },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, required: true },
  },
  { _id: false }
);

const cheatingLogSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true },
    screenshotUrl: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const cheatImageCapturedSchema = new mongoose.Schema(
  {
    TAB_SWITCH: { type: Boolean, default: false },
    MOBILE_DETECTED: { type: Boolean, default: false },
    MULTIPLE_PERSON: { type: Boolean, default: false },
    NO_FACE: { type: Boolean, default: false },
    NOT_FOCUSING: { type: Boolean, default: false },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    cheatingScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'SUBMITTED', 'CHEATING_CONFIRMED'],
      default: 'IN_PROGRESS',
    },
    cheatImageCaptured: { type: cheatImageCapturedSchema, default: () => ({}) },
    cheatingLogs: [cheatingLogSchema],
  },
  { _id: false }
);

const examRoomSchema = new mongoose.Schema(
  {
    examId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    password: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ['UPCOMING', 'LIVE', 'COMPLETED'],
      default: 'UPCOMING',
    },
    totalMarks: { type: Number, required: true },
    questions: [questionSchema],
    students: [studentSchema],
  },
  { timestamps: true }
);

examRoomSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

function generateExamId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'EXM-';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

examRoomSchema.statics.createExam = async function (data) {
  let examId;
  let exists = true;
  while (exists) {
    examId = generateExamId();
    exists = await this.exists({ examId });
  }
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const exam = await this.create({
    ...data,
    examId,
    password: hashedPassword,
  });
  return exam;
};

const ExamRoom = mongoose.model('ExamRoom', examRoomSchema);
export default ExamRoom;
