import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { HeartPulse, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    clearError();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-medical-500/5 blur-[100px] rounded-full -z-10" />

      <div className="w-full max-w-md space-y-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-1.5">
            <HeartPulse className="w-9 h-9 text-medical-500 animate-pulse" />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-medical-600 to-medical-400 bg-clip-text text-transparent">
              ResQAI
            </span>
          </Link>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Clinical Triage Access Portal
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-5 shadow-xl">
          <h2 className="text-xl font-extrabold text-slate-850 dark:text-white">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@resqai.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-danger-50 text-danger-600 rounded-xl text-xs flex items-center gap-2 border border-danger-500/10">
                <AlertTriangle className="w-4 h-4 shrink-0 text-danger-550" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-650 hover:to-medical-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Don\'t have an account? </span>
            <Link to="/signup" className="text-xs text-medical-500 font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Login;
