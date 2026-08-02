import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../utils/api.js';

const Navbar = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Generate some initial dynamic notifications for demo
    setNotifications([
      { id: 1, title: 'Critical Incident', message: 'Severe flood warning near Yamuna banks', type: 'danger', time: '5m ago' },
      { id: 2, title: 'AI Duplicate Flagged', message: 'SMS report grouped into existing CP Commercial Fire', type: 'ai', time: '12m ago' },
      { id: 3, title: 'Resource Status', message: 'Ambulance AMB-DELHI-01 deployed successfully', type: 'success', time: '20m ago' }
    ]);
  }, []);

  const formattedDate = liveTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = liveTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="h-16 bg-white border-b border-veryLightGray flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-20 shadow-sm">
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">CrowdMind AI</span>
        <div className="h-4 w-[1px] bg-veryLightGray"></div>
        <div className="flex items-center space-x-1.5 text-xs text-textMuted font-medium">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>EOC Command: India (Delhi National Capital Region)</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Live Clock */}
        <div className="hidden md:flex items-center space-x-2 text-right">
          <span className="text-xs font-semibold text-textMain">{formattedDate}</span>
          <span className="text-xs text-textMuted">|</span>
          <span className="text-xs font-mono font-bold text-primary">{formattedTime}</span>
        </div>

        {/* AI Engine Status indicator */}
        <div className="flex items-center space-x-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 pulse-animation" />
          <span>Gemini-1.5-Flash Active</span>
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 hover:bg-background rounded-full transition relative border border-veryLightGray"
          >
            <Bell className="w-4 h-4 text-textMain" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-veryLightGray rounded-2xl shadow-xl z-30 p-2 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-veryLightGray">
                <span className="text-xs font-bold text-textMain uppercase tracking-wide">Live Operations Feed</span>
                <button 
                  onClick={() => setNotifications([])}
                  className="text-[10px] font-medium text-primary hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-textMuted">No new operation alerts.</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-3 hover:bg-background border-b border-gray-50 last:border-b-0 rounded-xl transition flex items-start space-x-2.5"
                    >
                      <div className={`p-1 rounded-lg shrink-0 ${
                        notif.type === 'danger' ? 'bg-red-50 text-danger' :
                        notif.type === 'ai' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-success'
                      }`}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-semibold text-textMain truncate">{notif.title}</span>
                          <span className="text-[9px] text-textMuted shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-textMuted leading-normal line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
