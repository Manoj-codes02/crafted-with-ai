import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import { 
  Sun, 
  Moon, 
  Type, 
  Eye, 
  Globe, 
  LogOut, 
  User as UserIcon,
  Menu,
  HeartPulse
} from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { 
    theme, 
    toggleTheme, 
    largeText, 
    toggleLargeText, 
    highContrast, 
    toggleHighContrast, 
    language, 
    setLanguage 
  } = useThemeStore();

  const t = translations[language];
  const navigate = useNavigate();
  const [langDropdown, setLangDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/40 py-3 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <HeartPulse className="w-7 h-7 text-medical-500 animate-pulse" />
          <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-medical-600 to-medical-400 bg-clip-text text-transparent font-sans">
            {t.appTitle}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setLangDropdown(!langDropdown)}
            className="flex items-center gap-1.5 p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg text-sm transition-colors text-slate-700 dark:text-slate-350"
            title={t.language}
          >
            <Globe className="w-4.5 h-4.5" />
            <span className="uppercase text-xs font-semibold">{language}</span>
          </button>
          
          {langDropdown && (
            <div className="absolute right-0 mt-2 w-32 glass-panel shadow-lg rounded-xl overflow-hidden py-1 border border-slate-200/50 dark:border-slate-800/40 z-50">
              <button 
                onClick={() => { setLanguage('en'); setLangDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-medical-50 dark:hover:bg-slate-800/80 ${language === 'en' ? 'text-medical-600 font-bold' : ''}`}
              >
                English
              </button>
              <button 
                onClick={() => { setLanguage('hi'); setLangDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-medical-50 dark:hover:bg-slate-800/80 ${language === 'hi' ? 'text-medical-600 font-bold' : ''}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => { setLanguage('gu'); setLangDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-medical-50 dark:hover:bg-slate-800/80 ${language === 'gu' ? 'text-medical-600 font-bold' : ''}`}
              >
                ગુજરાતી
              </button>
            </div>
          )}
        </div>

        {/* Text Resize (Accessibility) */}
        <button 
          onClick={toggleLargeText}
          className={`p-2 rounded-lg transition-colors ${largeText ? 'bg-medical-100 text-medical-600 dark:bg-medical-950 dark:text-medical-400' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-750 dark:text-slate-300'}`}
          title={t.largeText}
        >
          <Type className="w-4.5 h-4.5" />
        </button>

        {/* Contrast Filter (Accessibility) */}
        <button 
          onClick={toggleHighContrast}
          className={`p-2 rounded-lg transition-colors ${highContrast ? 'bg-medical-100 text-medical-600 dark:bg-medical-950 dark:text-medical-400' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-750 dark:text-slate-300'}`}
          title={t.highContrast}
        >
          <Eye className="w-4.5 h-4.5" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg text-slate-750 dark:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* User Account / Logout */}
        {user ? (
          <div className="flex items-center gap-2 border-l border-slate-200/55 dark:border-slate-800/50 pl-2 md:pl-4">
            <Link to="/profile" className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-750 dark:text-slate-200">{user.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Authorized User</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-danger-50 dark:hover:bg-danger-950/30 text-slate-500 hover:text-danger-600 dark:hover:text-danger-400 rounded-lg transition-colors"
              title={t.logout}
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 bg-medical-500 hover:bg-medical-600 text-white rounded-lg text-xs font-semibold shadow-md shadow-medical-500/10 hover:shadow-medical-550/20 transition-all"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
