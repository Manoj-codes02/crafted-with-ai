import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import {
  LayoutDashboard,
  Activity,
  Flame,
  Map,
  FileText,
  User,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { language } = useThemeStore();
  const t = translations[language];

  const menuItems = [
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { name: t.assessment, path: '/assessment', icon: Activity },
    { name: t.disaster, path: '/disaster', icon: Flame },
    { name: t.hospitals, path: '/hospitals', icon: Map },
    { name: t.reports, path: '/reports', icon: FileText },
    { name: t.profile, path: '/profile', icon: User },
    { name: t.settings, path: '/settings', icon: Settings },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-45 w-64 lg:sticky lg:top-[69px] lg:h-[calc(100vh-69px)]
        glass-panel border-r border-slate-200/50 dark:border-slate-800/40 py-6 px-4
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between lg:hidden border-b border-slate-200/55 dark:border-slate-800/50 pb-4">
            <span className="font-bold text-slate-800 dark:text-slate-200">Navigation Menu</span>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-250 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-medical-500/15 to-medical-600/5 text-medical-600 dark:text-medical-400 border-l-4 border-medical-500 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-medical-500 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase shadow-medical-500/10">
            {user.name.slice(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
