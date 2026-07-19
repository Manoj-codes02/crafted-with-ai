import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  HeartPulse, 
  Activity, 
  Flame, 
  Map, 
  ShieldAlert, 
  Mic, 
  Eye, 
  Download, 
  QrCode, 
  ChevronRight,
  TrendingUp,
  Clock,
  Lock
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { value: '10k+', label: 'Assessments Processed', icon: Activity },
    { value: '98.8%', label: 'AI Accuracy Rating', icon: TrendingUp },
    { value: '< 5s', label: 'Triage Response Time', icon: Clock },
    { value: '100%', label: 'Encrypted Security', icon: Lock },
  ];

  const features = [
    {
      title: 'AI Symptom Triage',
      desc: 'Dictate symptoms or describe pain. Instantly receive clinical severity levels, triage reasoning, and warning signs.',
      icon: Activity,
      color: 'text-medical-500 bg-medical-500/10'
    },
    {
      title: 'Injury Visual Analyzer',
      desc: 'Upload images of cuts, burns, or wounds. The AI reviews skin conditions and presents custom care directions.',
      icon: Eye,
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      title: 'Multilingual Support',
      desc: 'Toggle between English, Hindi, and Gujarati dynamically. Access instructions in your local dialect.',
      icon: HeartPulse,
      color: 'text-success-500 bg-success-500/10'
    },
    {
      title: 'Disaster Guide',
      desc: 'Actionable procedures, Do\'s and Don\'ts during Fire, Floods, Chemical Leaks, or Venomous Snake Bites.',
      icon: Flame,
      color: 'text-danger-500 bg-danger-500/10'
    },
    {
      title: 'Emergency Locator',
      desc: 'GPS coordinates lookup to identify and locate nearby healthcare clinics and trauma centers instantly.',
      icon: Map,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Medical Profile QR',
      desc: 'Generate portable PDF triage reports containing a scan-ready QR code embedded with your medical summary.',
      icon: QrCode,
      color: 'text-purple-500 bg-purple-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      {/* Top Header/Nav */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-medical-500 animate-pulse" />
          <span className="text-2xl font-bold bg-gradient-to-r from-medical-600 to-medical-400 bg-clip-text text-transparent font-sans">
            ResQAI
          </span>
        </div>
        <div>
          {user ? (
            <Link 
              to="/dashboard"
              className="px-5 py-2.5 bg-medical-500 hover:bg-medical-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-medical-500/10 hover:shadow-medical-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login"
                className="px-4 py-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/55 rounded-xl text-sm font-semibold transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup"
                className="px-5 py-2.5 bg-medical-500 hover:bg-medical-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-medical-500/10 hover:shadow-medical-600/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 md:py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-medical-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-600 dark:text-medical-400 text-xs font-semibold uppercase tracking-wide mb-6">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AI-Driven Emergency Decision Core</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 font-sans leading-tight">
            Next-Gen AI Emergency <br />
            <span className="bg-gradient-to-r from-medical-500 via-indigo-500 to-medical-400 bg-clip-text text-transparent">
              Triage & Response
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
            ResQAI uses Google Gemini API to analyze trauma, triage symptom risk levels, generate step-by-step first aid guides, and package medical summaries in downloadable PDF reports with scanner QR codes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              to={user ? "/assessment" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-650 hover:to-medical-700 text-white rounded-2xl text-base font-semibold shadow-lg shadow-medical-500/20 hover:shadow-medical-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5 animate-pulse" />
              <span>Begin Symptom Triage</span>
            </Link>
            
            <Link 
              to={user ? "/disaster" : "/login"}
              className="w-full sm:w-auto px-8 py-4 glass-panel border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl text-base font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5 text-danger-500" />
              <span>Explore Disaster Guides</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-850">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl mb-3 shadow-xs">
                  <Icon className="w-5 h-5 text-medical-500" />
                </div>
                <span className="text-3xl md:text-4xl font-extrabold font-sans text-slate-850 dark:text-white">{stat.value}</span>
                <span className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Powerful Emergency Capabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Experience our intelligent emergency toolkit designed for offline access, accessibility safety, and clinical decision support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-8 rounded-3xl hover:border-medical-500/20 dark:hover:border-medical-500/25 transition-all group duration-300"
              >
                <div className={`p-3.5 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-105 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOS Alert Mock CTA */}
      <section className="py-16 px-6 max-w-5xl mx-auto mb-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-danger-600/90 to-red-800 text-white rounded-[2rem] p-8 md:p-14 shadow-xl shadow-danger-600/10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] -z-10" />
          
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">Critical Situation? Use One-Click SOS</h2>
            <p className="text-red-100 text-sm md:text-base leading-relaxed">
              Instantly broadcast an SMS emergency alert, containing your current GPS location coordinates and your saved medical profile metrics, directly to your designated contacts list.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link 
              to={user ? "/dashboard" : "/signup"}
              className="w-full md:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-danger-700 font-bold rounded-2xl text-center shadow-lg transition-all block"
            >
              Access SOS System
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-850 py-12 px-6 text-center text-xs md:text-sm text-slate-400 dark:text-slate-650 bg-white/40 dark:bg-slate-950/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-medical-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">ResQAI</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} ResQAI Inc. Crafted for Emergency Clinical Response Decision-Support.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
