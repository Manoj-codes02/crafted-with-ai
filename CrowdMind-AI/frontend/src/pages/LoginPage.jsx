import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, LogIn, Sparkles, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setErrorMsg('');
    switch (role) {
      case 'Admin':
        setEmail('admin@crowdmind.ai');
        setPassword('admin123');
        break;
      case 'RescueTeam':
        setEmail('rescue@crowdmind.ai');
        setPassword('rescue123');
        break;
      case 'Volunteer':
        setEmail('volunteer@crowdmind.ai');
        setPassword('volunteer123');
        break;
      case 'Viewer':
        setEmail('viewer@crowdmind.ai');
        setPassword('viewer123');
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-white border border-veryLightGray rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Banner Section */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary to-blue-600 p-8 flex flex-col justify-between text-white text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold">CrowdMind AI</span>
          </div>

          <div className="space-y-4 my-10">
            <h2 className="text-2xl font-bold leading-tight">Emergency Command Console</h2>
            <p className="text-xs text-blue-100 leading-relaxed">
              Login to view spatial intelligence reports, run the operations research solver, and coordinate response assets.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-blue-200/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 pulse-animation" />
            <span>Orion Global Hackathon Platform</span>
          </div>
        </div>

        {/* Form and Quick Select Section */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-textMain">Sign In</h3>
            <p className="text-xs text-textMuted mt-1">Select a role to autofill test credentials, or type manually.</p>
          </div>

          {/* Role select grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {[
              { label: 'Admin', role: 'Admin' },
              { label: 'Rescue Team', role: 'RescueTeam' },
              { label: 'Volunteer', role: 'Volunteer' },
              { label: 'Viewer', role: 'Viewer' }
            ].map((roleObj) => (
              <button
                key={roleObj.role}
                type="button"
                onClick={() => handleRoleSelect(roleObj.role)}
                className="flex items-center justify-center space-x-1.5 p-2 bg-darkWhite hover:bg-primary-light hover:text-primary border border-veryLightGray rounded-xl text-xs font-semibold text-textMain transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{roleObj.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-danger">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-textMain uppercase mb-1.5">Agency Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@crowdmind.ai"
                required
                className="w-full px-4 py-3 bg-darkWhite border border-veryLightGray rounded-xl text-sm outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textMain uppercase mb-1.5">Console Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-darkWhite border border-veryLightGray rounded-xl text-sm outline-none focus:border-primary transition"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Enter Workspace</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
