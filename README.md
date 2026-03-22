# AI-Powered Online Exam Monitoring System

Secure online exams with AI cheating detection (YOLOv8 + face detection).

## Tech Stack

- **Frontend**: React, Vite, Tailwind v3
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI Engine**: Python, FastAPI, YOLOv8, OpenCV

## Setup

### 1. MongoDB

Ensure MongoDB is running locally (default: `mongodb://localhost:27017`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with MONGODB_URI, JWT_SECRET
npm install
npm run dev
```

Backend runs on http://localhost:5000

### 3. AI Engine

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

AI engine runs on http://localhost:8000

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000 (proxies /api to backend)

## Usage

1. **Register** as Admin or Student
2. **Admin**: Create exams with MCQ questions, get Exam ID + password
3. **Student**: Join exam with Exam ID + password
4. **Student**: Take exam with camera; AI monitors for cheating
5. **Cheating** (tab switch, multiple persons, phone, no face) increases score; >= 100 auto-submits

## Environment

| Variable      | Description                    |
|---------------|--------------------------------|
| MONGODB_URI   | MongoDB connection string      |
| JWT_SECRET    | Secret for JWT signing         |
| AI_ENGINE_URL | AI service URL (default 8000)  |
