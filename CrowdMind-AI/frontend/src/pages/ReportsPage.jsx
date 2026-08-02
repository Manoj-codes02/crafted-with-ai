import React, { useState, useEffect } from 'react';
import API from '../utils/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  User, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // New report creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // Timeline update
  const [newTimelineDesc, setNewTimelineDesc] = useState('');
  const [newTimelineStatus, setNewTimelineStatus] = useState('Pending');
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const repRes = await API.get('/reports');
      const incRes = await API.get('/incidents');
      setReports(repRes.data);
      setIncidents(incRes.data);
      if (repRes.data.length > 0) {
        setSelectedReport(repRes.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!selectedIncidentId || !reportTitle) return;

    setIsCompiling(true);
    try {
      const incident = incidents.find(i => i._id === selectedIncidentId || i.id === selectedIncidentId);
      if (!incident) return;

      // 1. Generate AI Summary first
      const summaryRes = await API.post('/ai/summary', {
        title: incident.title,
        description: incident.description,
        locationName: incident.locationName,
        type: incident.type,
        priority: incident.priority,
        needs: incident.needs || 'General rescue assets',
        history: []
      });

      const aiSummary = summaryRes.data.summary;

      // 2. Submit new report
      const newReportRes = await API.post('/reports', {
        title: reportTitle,
        aiSummary,
        caseHistory: [
          {
            timestamp: new Date().toISOString(),
            status: incident.status,
            description: `Initial situation file opened from incident alert: "${incident.title}". Description: ${incident.description}`,
            updatedBy: 'System Operations Compiler'
          }
        ]
      });

      // Refresh list
      const updatedReps = await API.get('/reports');
      setReports(updatedReps.data);
      setSelectedReport(newReportRes.data);
      
      // Reset forms
      setReportTitle('');
      setSelectedIncidentId('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error compiling situation report:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAddTimelineEntry = async (e) => {
    e.preventDefault();
    if (!newTimelineDesc || !selectedReport) return;

    setIsAddingTimeline(true);
    try {
      const updatedHistory = [
        ...selectedReport.caseHistory,
        {
          timestamp: new Date().toISOString(),
          status: newTimelineStatus,
          description: newTimelineDesc,
          updatedBy: 'Operations Command Officer'
        }
      ];

      const response = await API.put(`/reports/${selectedReport._id || selectedReport.id}`, {
        caseHistory: updatedHistory
      });

      setSelectedReport(response.data);
      setNewTimelineDesc('');
      setNewTimelineStatus('Pending');
      
      // Refresh list
      const repRes = await API.get('/reports');
      setReports(repRes.data);
    } catch (err) {
      console.error('Error adding timeline entry:', err);
    } finally {
      setIsAddingTimeline(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!selectedReport) return;
    setIsCompiling(true);
    try {
      const summaryRes = await API.post('/ai/summary', {
        title: selectedReport.title,
        description: selectedReport.aiSummary,
        locationName: 'Active Sector Grid',
        type: 'General',
        priority: 'High',
        needs: 'Active Coordination',
        history: selectedReport.caseHistory
      });

      const response = await API.put(`/reports/${selectedReport._id || selectedReport.id}`, {
        aiSummary: summaryRes.data.summary
      });

      setSelectedReport(response.data);
      const repRes = await API.get('/reports');
      setReports(repRes.data);
    } catch (err) {
      console.error('Error regenerating summary:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans print:bg-white print:p-0">
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <div className="flex-1 pl-64 pt-16 flex flex-col print:pl-0 print:pt-0">
        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="p-6 flex-1 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full text-left print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
            <div>
              <h2 className="text-xl font-bold text-textMain flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span>Situation Reports Console</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">Compile official case files, coordinate summaries, and archive historical event logs.</p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-blue-600 shadow-sm shadow-primary/10 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Compile Situation Report</span>
              </button>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left List Pane (print:hidden) */}
            <div className="lg:col-span-4 bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
              <h3 className="text-xs font-bold text-textMain uppercase tracking-wider">Reports Archive</h3>
              <div className="space-y-2">
                {reports.length === 0 ? (
                  <div className="py-8 text-center text-xs text-textMuted">No situation reports archived.</div>
                ) : (
                  reports.map((rep) => (
                    <button
                      key={rep._id || rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`w-full p-4 text-left border rounded-xl transition flex flex-col space-y-1.5 hover:bg-background ${
                        selectedReport?._id === rep._id || selectedReport?.id === rep.id
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-veryLightGray bg-white'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-textMain line-clamp-1">{rep.title}</h4>
                      <p className="text-[10px] font-semibold text-textMuted flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(rep.createdDate).toLocaleDateString()}</span>
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Report Content Pane */}
            <div className="lg:col-span-8 space-y-6">
              {selectedReport ? (
                <div className="space-y-6">
                  {/* Action buttons (print:hidden) */}
                  <div className="flex justify-end space-x-2 print:hidden">
                    <button
                      onClick={handleRegenerateSummary}
                      disabled={isCompiling}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 border border-veryLightGray bg-white hover:bg-darkWhite text-xs font-semibold rounded-xl text-textMain transition"
                    >
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <span>{isCompiling ? 'Synthesizing...' : 'Refresh AI Summary'}</span>
                    </button>
                    
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white hover:bg-blue-600 text-xs font-semibold rounded-xl shadow-sm transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Export PDF / Print</span>
                    </button>
                  </div>

                  {/* PDF Document Container */}
                  <div className="bg-white border border-veryLightGray rounded-3xl p-8 shadow-sm space-y-8 text-left print:border-none print:shadow-none print:p-0">
                    {/* Header */}
                    <div className="border-b-2 border-primary pb-5 flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                          Official Incident Briefing
                        </span>
                        <h2 className="text-xl font-bold text-textMain mt-2">{selectedReport.title}</h2>
                        <div className="flex items-center space-x-2 text-[10px] font-semibold text-textMuted mt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Dated: {new Date(selectedReport.createdDate).toLocaleString()}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5" />
                            <span>Origin: Command Operations</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <div className="text-xs font-bold text-textMain uppercase tracking-wider">CrowdMind AI</div>
                        <div className="text-[9px] text-textMuted uppercase font-semibold mt-0.5">Report ID: {selectedReport._id || selectedReport.id}</div>
                      </div>
                    </div>

                    {/* AI Summary Block */}
                    <div className="p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-blue-100 rounded-2xl space-y-2 text-left relative overflow-hidden">
                      <div className="flex items-center space-x-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-primary pulse-animation shrink-0" />
                        <span>AI Situation Synthesis</span>
                      </div>
                      <p className="text-xs text-textMain leading-relaxed italic">{selectedReport.aiSummary}</p>
                    </div>

                    {/* Timeline History */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-textMain uppercase tracking-wider border-b border-veryLightGray pb-2">Operational timeline history</h3>
                      <div className="relative border-l-2 border-veryLightGray ml-3 pl-6 space-y-6">
                        {selectedReport.caseHistory.map((item, idx) => (
                          <div key={idx} className="relative text-left">
                            {/* Dot indicator */}
                            <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            </span>
                            
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center justify-between text-[10px] font-semibold text-textMuted">
                                <span>{new Date(item.timestamp).toLocaleString()}</span>
                                <span className="bg-darkWhite border border-veryLightGray px-2 py-0.5 rounded-md text-textMain">{item.updatedBy}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-textMain">{item.status}</span>
                              </div>
                              <p className="text-xs text-textMuted leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Timeline Entry Form (print:hidden) */}
                  <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm text-left print:hidden">
                    <h3 className="text-xs font-bold text-textMain uppercase tracking-wider mb-4">Append Timeline Entry</h3>
                    <form onSubmit={handleAddTimelineEntry} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Operational Status</label>
                        <select
                          value={newTimelineStatus}
                          onChange={(e) => setNewTimelineStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Critical Bottleneck">Critical Bottleneck</option>
                        </select>
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Incident Update Details</label>
                        <input
                          type="text"
                          value={newTimelineDesc}
                          onChange={(e) => setNewTimelineDesc(e.target.value)}
                          placeholder="e.g. River boat deployed to retrieve residents..."
                          required
                          className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={isAddingTimeline}
                          className="w-full py-2 px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition disabled:opacity-50"
                        >
                          {isAddingTimeline ? 'Adding...' : 'Add Log'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-veryLightGray rounded-3xl p-12 text-center text-xs text-textMuted">
                  No reports available.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Compile Situation Report Modal (print:hidden) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-veryLightGray rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-veryLightGray pb-4 mb-4">
              <h3 className="font-bold text-base text-textMain flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Compile Situation Report</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-textMuted hover:text-textMain text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-textMain uppercase mb-1.5">Select Origin Incident Ticket</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => {
                    setSelectedIncidentId(e.target.value);
                    const inc = incidents.find(i => i._id === e.target.value || i.id === e.target.value);
                    if (inc) {
                      setReportTitle(`${inc.type.toUpperCase()}: ${inc.locationName} Briefing File`);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                >
                  <option value="">-- Choose Active Incident --</option>
                  {incidents.filter(i => i.status !== 'Resolved').map((inc) => (
                    <option key={inc._id || inc.id} value={inc._id || inc.id}>
                      [{inc.priority}] {inc.title} - {inc.locationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMain uppercase mb-1.5">Official Document Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. FLOOD SITUATION BRIEF: SECTOR 15"
                  required
                  className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                />
              </div>

              <button
                type="submit"
                disabled={isCompiling}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCompiling ? 'Synthesizing with Gemini...' : 'Compile Briefing (AI Auto-Summary)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
