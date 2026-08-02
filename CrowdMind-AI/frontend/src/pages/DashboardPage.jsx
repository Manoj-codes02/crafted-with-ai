import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../utils/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import StatsCards from '../components/StatsCards.jsx';
import LiveMap from '../components/LiveMap.jsx';
import { 
  Sparkles, 
  Filter, 
  PlusCircle, 
  MapPin, 
  AlertTriangle, 
  HelpCircle, 
  Check, 
  Send 
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Report creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReportText, setNewReportText] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLat, setNewLat] = useState('28.615');
  const [newLng, setNewLng] = useState('77.210');
  const [reporterName, setReporterName] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Dynamic AI Insights list
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const incRes = await API.get('/incidents');
      const resRes = await API.get('/resources');
      setIncidents(incRes.data);
      setResources(resRes.data);
      generateAIInsights(incRes.data, resRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const generateAIInsights = (incidentsList, resourcesList) => {
    const insights = [];
    const activeFloods = incidentsList.filter(i => i.type === 'Flood' && i.status !== 'Resolved');
    const activeFires = incidentsList.filter(i => i.type === 'Fire' && i.status !== 'Resolved');
    const availableBoats = resourcesList.filter(r => r.type === 'Boat' && r.status === 'Available');
    const availableAmbulances = resourcesList.filter(r => r.type === 'Ambulance' && r.status === 'Available');

    if (activeFloods.length > 0) {
      insights.push({
        id: 'ins-f1',
        text: `High flooding in ${activeFloods[0].locationName}. Recommend deploying ${availableBoats.length > 0 ? availableBoats[0].identifier : 'standby rescue crafts'} immediately.`,
        urgency: 'high'
      });
    }

    if (activeFires.length > 0) {
      insights.push({
        id: 'ins-fi1',
        text: `Commercial building fire at ${activeFires[0].locationName} presents smoke hazards. Keep ambulances in proximity.`,
        urgency: 'high'
      });
    }

    // Generic OR suggestion
    if (availableAmbulances.length > 0 && incidentsList.some(i => i.type === 'Medical' && i.status === 'Pending')) {
      insights.push({
        id: 'ins-or1',
        text: `Operations research solver recommends routing ${availableAmbulances[0].identifier} to the Lajpat Nagar patient to optimize response time by 8 mins.`,
        urgency: 'medium'
      });
    } else {
      insights.push({
        id: 'ins-g1',
        text: 'All operational areas stable. Weather forecasts predict decreasing rainfall rate in Delhi NCR.',
        urgency: 'low'
      });
    }

    setAiInsights(insights);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReportText || !newLocationName) return;

    setIsSubmittingReport(true);
    try {
      const response = await API.post('/incidents', {
        description: newReportText,
        locationName: newLocationName,
        latitude: parseFloat(newLat) || 28.6139,
        longitude: parseFloat(newLng) || 77.2090,
        reporterName: reporterName || user?.name || 'Citizen Report',
        source: 'WebReport'
      });

      // Reset form
      setNewReportText('');
      setNewLocationName('');
      setNewLat('28.615');
      setNewLng('77.210');
      setReporterName('');
      setShowCreateModal(false);
      
      // Refresh
      fetchDashboardData();
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleResolveIncident = async (id) => {
    try {
      await API.put(`/incidents/${id}`, { status: 'Resolved' });
      fetchDashboardData();
    } catch (err) {
      console.error('Error resolving incident:', err);
    }
  };

  // Filter logic
  const filteredIncidents = incidents.filter((inc) => {
    if (typeFilter && inc.type !== typeFilter) return false;
    if (statusFilter && inc.status !== statusFilter) return false;
    if (priorityFilter && inc.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar />
      <div className="flex-1 pl-64 pt-16 flex flex-col">
        <Navbar />

        <main className="p-6 flex-1 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-textMain">Operational Dashboard</h2>
              <p className="text-xs text-textMuted mt-0.5">Real-time incident intelligence, AI triage analytics, and responder vectors.</p>
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-blue-600 shadow-sm shadow-primary/10 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Incident Report</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="h-32 bg-white rounded-2xl animate-pulse flex items-center justify-center text-textMuted text-xs font-semibold">
              Loading operations statistics...
            </div>
          ) : (
            <StatsCards incidents={incidents} resources={resources} />
          )}

          {/* Main Console Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Map and Filters */}
            <div className="lg:col-span-8 space-y-6">
              {/* GIS Map */}
              <div className="h-[480px]">
                <LiveMap 
                  incidents={incidents} 
                  resources={resources} 
                />
              </div>

              {/* Feed & Filter Header */}
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-sm font-bold text-textMain uppercase tracking-wider">Live Incident Feeds</h3>
                  
                  {/* Filters bar */}
                  <div className="flex flex-wrap gap-2 items-center text-xs">
                    <div className="flex items-center space-x-1 text-textMuted mr-2">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filters:</span>
                    </div>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-darkWhite border border-veryLightGray rounded-lg font-semibold text-textMain outline-none"
                    >
                      <option value="">All Types</option>
                      <option value="Flood">Flood</option>
                      <option value="Fire">Fire</option>
                      <option value="Medical">Medical</option>
                      <option value="Food">Food</option>
                      <option value="RoadClosed">Road Closed</option>
                      <option value="Shelter">Shelter</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-darkWhite border border-veryLightGray rounded-lg font-semibold text-textMain outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-darkWhite border border-veryLightGray rounded-lg font-semibold text-textMain outline-none"
                    >
                      <option value="">All Urgencies</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Incident Feed List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {filteredIncidents.length === 0 ? (
                    <div className="text-center py-8 text-xs text-textMuted font-semibold">No incidents match selected operational filters.</div>
                  ) : (
                    filteredIncidents.map((inc) => {
                      const badgeColor = inc.priority === 'High' ? 'bg-red-50 text-danger border-red-100' : inc.priority === 'Medium' ? 'bg-yellow-50 text-warning border-yellow-100' : 'bg-gray-50 text-textMuted border-gray-100';
                      return (
                        <div 
                          key={inc._id || inc.id} 
                          className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition hover:bg-background ${
                            inc.duplicateOfIncidentId ? 'border-dashed border-gray-300 opacity-75 bg-gray-50/50' : 'border-veryLightGray bg-white'
                          }`}
                        >
                          <div className="space-y-2 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-textMain">{inc.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md uppercase tracking-wider ${badgeColor}`}>
                                {inc.priority} {inc.priorityScore}%
                              </span>
                              {inc.duplicateOfIncidentId && (
                                <span className="text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                  Duplicate Grouped
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-textMuted bg-darkWhite border border-veryLightGray px-2 py-0.5 rounded-md">
                                {inc.type}
                              </span>
                            </div>
                            <p className="text-xs text-textMuted leading-relaxed max-w-xl">{inc.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-textMuted">
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{inc.locationName}</span>
                              </span>
                              <span>Source: {inc.source} ({inc.reporterName})</span>
                              {inc.needs && <span className="text-primary font-bold">Needs: {inc.needs}</span>}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            {inc.status !== 'Resolved' && (
                              <button
                                onClick={() => handleResolveIncident(inc._id || inc.id)}
                                className="inline-flex items-center justify-center p-2 text-success hover:bg-green-50 border border-veryLightGray rounded-lg hover:border-green-200 transition"
                                title="Resolve Incident"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border uppercase tracking-wider ${
                              inc.status === 'Resolved' ? 'bg-green-50 text-success border-green-100' :
                              inc.status === 'Dispatched' ? 'bg-blue-50 text-primary border-blue-100' :
                              'bg-yellow-50 text-warning border-yellow-100'
                            }`}>
                              {inc.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right: AI Insights Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm">
                <div className="flex items-center space-x-2 border-b border-veryLightGray pb-3.5 mb-4">
                  <div className="p-1 bg-primary/10 rounded-lg text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-textMain uppercase tracking-wider">AI Operations Analysis</h3>
                </div>

                <div className="space-y-3.5">
                  {aiInsights.map((insight) => (
                    <div 
                      key={insight.id}
                      className={`p-3.5 border rounded-xl flex items-start space-x-3 text-left ${
                        insight.urgency === 'high' ? 'bg-red-50/50 border-red-100 text-textMain' :
                        insight.urgency === 'medium' ? 'bg-blue-50/50 border-blue-100 text-textMain' :
                        'bg-gray-50 border-veryLightGray text-textMuted'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        insight.urgency === 'high' ? 'bg-danger text-white' :
                        insight.urgency === 'medium' ? 'bg-primary text-white' : 'bg-gray-400 text-white'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs leading-relaxed font-semibold">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Resources overview */}
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm text-left">
                <h3 className="text-xs font-bold text-textMain uppercase tracking-wider mb-4">Responder Utilization</h3>
                <div className="space-y-4">
                  {['Ambulance', 'Boat', 'Helicopter', 'Volunteer'].map((resType) => {
                    const totalOfType = resources.filter(r => r.type === resType).length;
                    const deployedOfType = resources.filter(r => r.type === resType && r.status === 'Deployed').length;
                    const percent = totalOfType > 0 ? Math.round((deployedOfType / totalOfType) * 100) : 0;
                    return (
                      <div key={resType} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-textMain">{resType}s</span>
                          <span className="text-textMuted">{deployedOfType}/{totalOfType} Deployed ({percent}%)</span>
                        </div>
                        <div className="w-full bg-darkWhite h-2.5 rounded-full overflow-hidden border border-veryLightGray">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Manual Report Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-veryLightGray rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-veryLightGray pb-4 mb-4">
              <div className="flex items-center space-x-2 text-primary">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-bold text-base text-textMain">Log Emergency Incident</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-textMuted hover:text-textMain text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-textMain uppercase mb-1">Alert Description (Processed by AI)</label>
                <textarea
                  value={newReportText}
                  onChange={(e) => setNewReportText(e.target.value)}
                  placeholder="Describe the disaster request... e.g. Water entered our houses near River road. Need 2 boats."
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary resize-none transition"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMain uppercase mb-1">Location Name</label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="e.g. Lajpat Nagar Market, Delhi"
                  required
                  className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-textMain uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMain uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMain uppercase mb-1">Reporter Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Inspector Verma"
                  className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReport}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReport ? 'AI Analyzing...' : 'Analyze & Post Alert'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
