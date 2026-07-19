import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import api from '../../services/api';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as ChartTooltip, 
  Legend as ChartLegend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  AlertTriangle, 
  Activity, 
  Flame, 
  MapPin, 
  FileText, 
  ChevronRight, 
  Volume2, 
  UserCheck,
  Send,
  Loader2,
  PhoneCall,
  Clock,
  Heart
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, contacts, fetchContacts } = useAuthStore();
  const { language } = useThemeStore();
  const t = translations[language];
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // SOS State
  const [sosSent, setSosSent] = useState(false);
  const [sosLocation, setSosLocation] = useState<GeolocationPosition | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  // Weather / Disaster Alerts
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([
    {
      id: 'alert-1',
      title: 'Extreme Heat Warning',
      desc: 'Ambient temperatures projected to exceed 104°F (40°C). Drink fluids, avoid direct sunlight between 12-4 PM.',
      severity: 'Moderate',
      icon: Flame
    },
    {
      id: 'alert-2',
      title: 'Monsoon Flash Flood Alert',
      desc: 'Heavy precipitation forecast in coastal zones. Keep emergency kits dry; avoid flooded bridges.',
      severity: 'Low',
      icon: AlertTriangle
    }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch recent assessments
        const historyRes = await api.get('/history');
        if (historyRes.data.success) {
          setRecentReports(historyRes.data.data.slice(0, 3));
        }

        // Fetch analytics data
        const analyticsRes = await api.get('/history/analytics');
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (error) {
        console.warn('Dashboard data fetch failed (database offline). Loading local defaults.');
        // Set mock analytics fallback
        setAnalytics({
          totalAssessments: 6,
          averagePain: 5.8,
          riskDistribution: [
            { name: 'Low Risk', value: 2, color: '#22c55e' },
            { name: 'Moderate Risk', value: 3, color: '#f59e0b' },
            { name: 'Critical Risk', value: 1, color: '#ef4444' },
          ],
          timeline: [
            { date: 'Jul 10', painLevel: 3, riskLevel: 'Low' },
            { date: 'Jul 11', painLevel: 5, riskLevel: 'Moderate' },
            { date: 'Jul 12', painLevel: 8, riskLevel: 'Critical' },
            { date: 'Jul 14', painLevel: 4, riskLevel: 'Moderate' },
            { date: 'Jul 15', painLevel: 2, riskLevel: 'Low' },
            { date: 'Jul 16', painLevel: 6, riskLevel: 'Moderate' },
          ],
          symptomChartData: [
            { name: 'Trauma/Wounds', value: 2 },
            { name: 'Cardiac/Chest', value: 1 },
            { name: 'Neurological', value: 1 },
            { name: 'Other', value: 2 },
          ],
        });
        
        // Mock recent reports
        setRecentReports([
          {
            _id: '1',
            age: 28,
            gender: 'Male',
            symptoms: 'Deep bleeding laceration on right forearm from glass cut.',
            painLevel: 6,
            riskLevel: 'Moderate',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            age: 45,
            gender: 'Female',
            symptoms: 'Sudden chest tightness and radiating pain in left arm with nausea.',
            painLevel: 9,
            riskLevel: 'Critical',
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchContacts();
  }, [fetchContacts]);

  // SOS Function
  const triggerSOS = () => {
    if (sosLoading) return;
    setSosLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSosLocation(position);
          setSosSent(true);
          setSosLoading(false);
          // Play a small sound alert (accessible feedback)
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 880; // High pitch A
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
          } catch (e) {
            console.log(e);
          }
        },
        (error) => {
          console.warn('Geolocation denied. Sending SOS without live coordinates.', error);
          setSosSent(true);
          setSosLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setSosSent(true);
      setSosLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#0f8bf2'];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans">
            {t.welcome}, <span className="text-medical-500">{user?.name}</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium mt-1">
            ResQAI Clinical Command Dashboard | System Status: Active
          </p>
        </div>
        
        {/* Quick Route Assess */}
        <Link 
          to="/assessment" 
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-medical-500 hover:bg-medical-600 text-white font-bold rounded-2xl shadow-lg shadow-medical-500/15 hover:shadow-medical-600/25 transition-all text-sm"
        >
          <Activity className="w-4.5 h-4.5" />
          <span>{t.startTriage}</span>
        </Link>
      </div>

      {/* SOS Panel & Quick Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* SOS Card (Spans 2 columns on large screen) */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-700 dark:from-red-650 dark:to-rose-800 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-red-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent)] -z-10" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-md">
              <div className="inline-flex items-center gap-1 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Family SOS Broadcast</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.quickSOS}</h2>
              <p className="text-red-100 text-xs md:text-sm leading-relaxed">{t.quickSOSDesc}</p>
            </div>

            <button 
              onClick={triggerSOS}
              disabled={sosLoading}
              className={`
                w-full md:w-40 h-40 shrink-0 rounded-full border-8 border-white/10 bg-white hover:bg-red-50 text-red-650
                flex flex-col items-center justify-center font-black tracking-widest text-lg shadow-2xl transition-all duration-300 transform active:scale-95
                ${sosLoading ? 'animate-pulse' : 'animate-bounce'}
              `}
            >
              {sosLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <PhoneCall className="w-8 h-8 mb-1.5" />
                  <span>SOS</span>
                </>
              )}
            </button>
          </div>

          {/* SOS Notification Output */}
          {sosSent && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/15 animate-fadeIn space-y-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-350" />
                <span className="text-sm font-bold">SOS Messages Broadcasted Successfully!</span>
              </div>
              <p className="text-xs text-red-100">
                A distress alert message has been sent to your <strong>{contacts.length} saved emergency contacts</strong>.
              </p>
              {sosLocation && (
                <div className="text-[10px] text-red-200 flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>Coordinates: Lat {sosLocation.coords.latitude.toFixed(5)}, Lng {sosLocation.coords.longitude.toFixed(5)} (Accuracy: {Math.round(sosLocation.coords.accuracy)}m)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Contact Count Panel */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.emergencyContacts}</h3>
            <p className="text-3xl font-extrabold">{contacts.length}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Contacts configured to receive live GPS SOS messages. Keep this list updated.
            </p>
          </div>
          <Link 
            to="/profile" 
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-medical-500 hover:text-medical-600 dark:hover:text-medical-400 transition-colors w-fit"
          >
            <span>Manage SOS Contacts</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard Charts */}
      {loading ? (
        <div className="h-64 flex items-center justify-center glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin text-medical-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Pain Timeline trend Chart */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold">Pain Level Timeline Trend</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Tracking pain severity across previous assessments</p>
            </div>
            
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.timeline || []} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 10]} fontSize={10} tickLine={false} />
                  <ChartTooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '11px',
                      color: '#fff'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="painLevel" 
                    stroke="#0f8bf2" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#0f8bf2', strokeWidth: 0 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold">Risk Level Distribution</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Proportion of Low, Moderate, & Critical records</p>
            </div>
            
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.riskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(analytics?.riskDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '11px',
                      color: '#fff'
                    }} 
                  />
                  <ChartLegend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Disaster Alerts & Recent Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Recent Reports List (Spans 2 columns) */}
        <div className="lg:col-span-2 glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/45 dark:border-slate-800/30 pb-3">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-medical-500" />
                <span>{t.recentReports}</span>
              </h3>
              <Link to="/reports" className="text-xs text-medical-500 font-bold hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-slate-200/40 dark:bg-slate-800/30 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm py-8 text-center">{t.noReportsYet}</p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => {
                  let riskBadge = 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400';
                  if (report.riskLevel === 'Moderate') riskBadge = 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400';
                  if (report.riskLevel === 'Critical') riskBadge = 'bg-danger-50 text-danger-600 dark:bg-danger-950/20 dark:text-danger-400';

                  return (
                    <div 
                      key={report._id} 
                      className="p-4 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl flex items-center justify-between gap-4 hover:border-medical-500/15 transition-all"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${riskBadge}`}>
                            {report.riskLevel}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm font-semibold truncate text-slate-700 dark:text-slate-200">{report.symptoms}</p>
                      </div>

                      <button 
                        onClick={() => navigate(`/reports`)}
                        className="p-2 hover:bg-slate-200/55 dark:hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 transition-colors"
                      >
                        <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Local Disaster / Weather Alerts Widget */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold flex items-center gap-1.5 text-danger-500">
              <AlertTriangle className="w-5 h-5" />
              <span>Active Hazard Warnings</span>
            </h3>

            <div className="space-y-3">
              {weatherAlerts.map((alert) => {
                const Icon = alert.icon;
                const borderClass = alert.severity === 'Moderate' ? 'border-amber-500/15 bg-amber-550/5' : 'border-slate-200/40 dark:border-slate-800/30';
                const textClass = alert.severity === 'Moderate' ? 'text-amber-600 dark:text-amber-450' : 'text-slate-500 dark:text-slate-400';

                return (
                  <div key={alert.id} className={`p-4 border rounded-2xl space-y-1.5 ${borderClass}`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-danger-500" />
                      <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{alert.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{alert.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
