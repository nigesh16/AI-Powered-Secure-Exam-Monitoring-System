import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Mocking auth state
  const { user, loading } = { user: null, loading: false }; 

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-50 selection:text-indigo-700 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-slate-900 font-bold tracking-tight text-lg">ExamGuard</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-indigo-600 transition-all active:scale-95">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 md:hidden shadow-xl transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <Link to="/login" className="w-full py-3 text-center font-semibold text-slate-600 bg-slate-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
          <Link to="/register" className="w-full py-3 text-center font-semibold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 md:pt-52 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-indigo-50 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">The Modern Proctoring Standard</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Integrity you can trust. <br />
            <span className="text-slate-400">Exams you can scale.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            A seamless, secure, and responsive platform designed to protect academic standards globally while prioritizing the student experience.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all text-lg">
              Create Account
            </Link>
            <Link to="/login" className="px-10 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-lg">
              Login
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="group p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-1.17-11.238L7 11V7m0 10l-3 1m14-8l-3-1M5 10v4a8 8 0 018 8v0" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Identity Shield</h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              Automated biometric verification ensuring the right student is present without invasive monitoring.
            </p>
          </div>

          <div className="group p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Real-time Sync</h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              Proprietary technology that prevents lag even on low-bandwidth student connections globally.
            </p>
          </div>

          <div className="group p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Data Sovereignty</h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              Every session is fully encrypted and stored securely to meet international compliance standards.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-[10px] text-white font-bold">EG</div>
            <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">ExamGuard</span>
          </div>
          
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <button className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button className="hover:text-indigo-600 transition-colors">Legal</button>
            <button className="hover:text-indigo-600 transition-colors">Contact</button>
          </div>

          <p className="text-xs font-medium text-slate-400">
            © 2026 ExamGuard Systems Intl.
          </p>
        </div>
      </footer>
    </div>
  );
}