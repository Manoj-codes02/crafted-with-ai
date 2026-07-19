import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <HeartPulse className="w-16 h-16 text-medical-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-850 dark:text-white">404</h1>
          <h2 className="text-xl font-bold">Clinical Path Not Found</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            The page you are looking for does not exist or has been relocated to another corridor.
          </p>
        </div>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-medical-500 hover:bg-medical-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-medical-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
