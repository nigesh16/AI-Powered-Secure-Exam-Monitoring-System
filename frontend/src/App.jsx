import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import CreateExam from './pages/CreateExam';
import ExamDetail from './pages/ExamDetail';
import StudentHome from './pages/StudentHome';
import ExamRoom from './pages/ExamRoom';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/create"
        element={
          <ProtectedRoute role="ADMIN">
            <CreateExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/:examId"
        element={
          <ProtectedRoute role="ADMIN">
            <ExamDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute role="STUDENT">
            <StudentHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exam/:examId"
        element={
          <ProtectedRoute role="STUDENT">
            <ExamRoom />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
