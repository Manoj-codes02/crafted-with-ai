import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  FileText, 
  Radio, 
  Settings, 
  LogOut, 
  Cpu, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'RescueTeam', 'Volunteer', 'Viewer'] },
    { name: 'Operations Research', path: '/optimization', icon: Cpu, roles: ['Admin', 'RescueTeam', 'Volunteer'] },
    { name: 'Situation Reports', path: '/reports', icon: FileText, roles: ['Admin', 'RescueTeam', 'Volunteer', 'Viewer'] },
    { name: 'Social Media AI', path: '/social-feed', icon: Radio, roles: ['Admin', 'RescueTeam', 'Volunteer'] },
    { name: 'Admin Panel', path: '/admin', icon: Settings, roles: ['Admin'] },
  ];

  const filteredLinks = links.filter(link => !link.roles || (user && link.roles.includes(user.role)));

  return (
    <aside className="w-64 h-screen bg-white border-r border-veryLightGray flex flex-col justify-between fixed left-0 top-0 pt-16 z-10">
      <div className="px-4 py-6">
        <div className="flex items-center space-x-2 px-3 mb-8">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight tracking-tight">CrowdMind AI</h1>
            <span className="text-[10px] font-medium text-textMuted tracking-wider uppercase">Orion Operations Hub</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-light text-primary border-l-4 border-primary pl-3'
                      : 'text-textMuted hover:bg-background hover:text-textMain'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-veryLightGray bg-darkWhite">
        <div className="flex items-center justify-between mb-4">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-textMain truncate">{user?.name || 'User Profile'}</p>
            <p className="text-[10px] font-medium text-textMuted uppercase tracking-wider">{user?.role || 'Viewer'}</p>
          </div>
          <div className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded-md border border-primary/20">
            {user?.role === 'Admin' ? 'HQ' : 'Field'}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-veryLightGray rounded-xl text-sm text-danger hover:bg-red-50 hover:border-red-100 transition-all font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
