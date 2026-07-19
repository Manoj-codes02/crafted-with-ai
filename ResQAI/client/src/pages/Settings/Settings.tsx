import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import { 
  Settings as SettingsIcon,
  Sun, 
  Moon, 
  Type, 
  Eye, 
  Globe, 
  Database,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const Settings: React.FC = () => {
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

  const clearCache = () => {
    localStorage.removeItem('resqai_disaster_cache');
    alert('Local offline handbook cache refreshed successfully.');
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">
          {t.settings}
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium mt-1">
          Configure application visual configurations, translations, and local caches
        </p>
      </div>

      <div className="max-w-2xl glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-8">
        
        {/* Language switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/45 dark:border-slate-800/30">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-medical-500" />
              <span>{t.language}</span>
            </h3>
            <p className="text-xs text-slate-400">Select language for interface and AI recommendations</p>
          </div>
          
          <div className="flex gap-2">
            {(['en', 'hi', 'gu'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-bold border transition-all uppercase
                  ${language === lang 
                    ? 'border-medical-500 bg-medical-500 text-white shadow-xs' 
                    : 'border-slate-200/40 dark:border-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-900/35 text-slate-500'
                  }
                `}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'ગુજ'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme mode switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/45 dark:border-slate-800/30">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              {theme === 'light' ? <Sun className="w-4.5 h-4.5 text-medical-500" /> : <Moon className="w-4.5 h-4.5 text-medical-500" />}
              <span>Application Theme</span>
            </h3>
            <p className="text-xs text-slate-400">Switch between light mode and dark mode layouts</p>
          </div>
          
          <button
            onClick={toggleTheme}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </button>
        </div>

        {/* Font size accessibility */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/45 dark:border-slate-800/30">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Type className="w-4.5 h-4.5 text-medical-500" />
              <span>{t.largeText}</span>
            </h3>
            <p className="text-xs text-slate-400">Enlarge text elements for comfortable readability</p>
          </div>
          
          <button
            onClick={toggleLargeText}
            className={`
              px-5 py-2.5 rounded-xl text-xs font-bold border transition-all
              ${largeText 
                ? 'border-medical-500 bg-medical-500 text-white shadow-xs' 
                : 'border-slate-200/40 dark:border-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-900/35 text-slate-500'
              }
            `}
          >
            {largeText ? 'Large Text Enabled' : 'Enable Large Text'}
          </button>
        </div>

        {/* High contrast accessibility */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/45 dark:border-slate-800/30">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Eye className="w-4.5 h-4.5 text-medical-500" />
              <span>{t.highContrast}</span>
            </h3>
            <p className="text-xs text-slate-400">Apply high contrast color filters for visual safety</p>
          </div>
          
          <button
            onClick={toggleHighContrast}
            className={`
              px-5 py-2.5 rounded-xl text-xs font-bold border transition-all
              ${highContrast 
                ? 'border-medical-500 bg-medical-500 text-white shadow-xs' 
                : 'border-slate-200/40 dark:border-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-900/35 text-slate-500'
              }
            `}
          >
            {highContrast ? 'High Contrast Enabled' : 'Enable High Contrast'}
          </button>
        </div>

        {/* Cache administration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-medical-500" />
              <span>Offline Data Cache</span>
            </h3>
            <p className="text-xs text-slate-400">Refresh locally saved emergency response guides</p>
          </div>
          
          <button
            onClick={clearCache}
            className="px-5 py-2.5 bg-danger-500/10 text-danger-650 hover:bg-danger-550/20 border border-danger-500/20 rounded-xl text-xs font-bold transition-all"
          >
            Clear Local Cache
          </button>
        </div>

      </div>
    </div>
  );
};
export default Settings;
