import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { login } from '../api';

/**
 * Modern UI Components - Blue & Black Theme
 */

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200/50">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <span className="text-slate-900 font-bold tracking-tighter text-xl">ExamGuard</span>
  </Link>
);

const FormInput = ({ label, type, value, onChange, placeholder, required }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/5 outline-none transition-all duration-200 text-slate-900 text-sm font-medium placeholder:text-slate-400"
    />
  </div>
);

export default function Login() {

  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login: authLogin } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const data = await login({ role, email, password });

      authLogin(data);

      alert("Login successful!");

      navigate(role === 'ADMIN' ? '/admin' : '/student');

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col items-center justify-center p-6">
      
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 w-full p-8 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <Logo />
        </div>
        <Link to="/" className="pointer-events-auto text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
          Support
        </Link>
      </div>

      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">

          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Sign in
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Access your secure examination dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Selector */}

            <div className="flex border-b border-slate-100 mb-2">

              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  role === 'STUDENT'
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Student
                {role === 'STUDENT' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  role === 'ADMIN'
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Admin
                {role === 'ADMIN' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
              </button>

            </div>

            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@email.com"
            />

            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-[11px] font-bold uppercase tracking-wider bg-red-50 p-3 rounded-lg border border-red-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Continue'
              )}
            </button>

          </form>

          <div className="mt-4 pt-4 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New here?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          Secured by ExamGuard Protocol
        </p>

      </div>
    </div>
  );
}