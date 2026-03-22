import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/userRoutes.js';

connectDB();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
