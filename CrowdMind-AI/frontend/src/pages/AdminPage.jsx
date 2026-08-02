import React, { useState, useEffect } from 'react';
import API from '../utils/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  Settings, 
  PlusCircle, 
  Users, 
  Truck, 
  Terminal, 
  Save, 
  Cpu,
  Trash2
} from 'lucide-react';

const AdminPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Resource Form
  const [resType, setResType] = useState('Ambulance');
  const [resIdentifier, setResIdentifier] = useState('');
  const [resLat, setResLat] = useState('28.6139');
  const [resLng, setResLng] = useState('77.2090');
  const [resCapacity, setResCapacity] = useState('2');
  const [resSubmitting, setResSubmitting] = useState(false);

  // Settings
  const [geminiKey, setGeminiKey] = useState('');
  const [useMockDb, setUseMockDb] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAdminData();
    // Load local storage AI key if preset
    const key = localStorage.getItem('crowdmind_gemini_key') || '';
    setGeminiKey(key);
  }, []);

  const fetchAdminData = async () => {
    try {
      const resRes = await API.get('/resources');
      setResources(resRes.data);
      
      // Mock system logs
      setLogs([
        { id: 1, time: new Date(Date.now() - 300000).toISOString(), message: 'Operations research model solved successfully.' },
        { id: 2, time: new Date(Date.now() - 900000).toISOString(), message: 'Aggregated 3 social media feed items from mock gateways.' },
        { id: 3, time: new Date(Date.now() - 1800000).toISOString(), message: 'Connected to local JSON database fallback: incidents.json and resources.json initialized.' },
        { id: 4, time: new Date(Date.now() - 3600000).toISOString(), message: 'CrowdMind AI server bootstrapped. API running on port 5000.' }
      ]);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resIdentifier) return;

    setResSubmitting(true);
    try {
      await API.post('/resources', {
        type: resType,
        identifier: resIdentifier,
        status: 'Available',
        currentLatitude: parseFloat(resLat),
        currentLongitude: parseFloat(resLng),
        capacity: parseInt(resCapacity) || 1
      });

      // Reset
      setResIdentifier('');
      setResCapacity('2');
      fetchAdminData();
    } catch (err) {
      console.error('Error adding resource:', err);
    } finally {
      setResSubmitting(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to remove this emergency resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('crowdmind_gemini_key', geminiKey);
    alert('System Settings Saved. Gemini API integrations will now use the provided key.');
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar />
      <div className="flex-1 pl-64 pt-16 flex flex-col">
        <Navbar />

        <main className="p-6 flex-1 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-textMain flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary shrink-0" />
                <span>Operational Control Admin Panel</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">Manage resource registries, customize LLM weights, and view system diagnostic audits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Resource registry */}
            <div className="lg:col-span-8 space-y-6">
              {/* Resources Table */}
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-veryLightGray pb-3">
                  <h3 className="text-xs font-bold text-textMain uppercase tracking-wider flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-primary shrink-0" />
                    <span>Emergency Resource Registry</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-veryLightGray text-textMuted font-bold bg-darkWhite">
                        <th className="p-3">Identifier</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Coordinates (Lat, Lng)</th>
                        <th className="p-3">Capacity</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-textMain">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-textMuted">Loading registry records...</td>
                        </tr>
                      ) : resources.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-textMuted">No resources registered.</td>
                        </tr>
                      ) : (
                        resources.map((res) => (
                          <tr key={res._id || res.id} className="hover:bg-background/40">
                            <td className="p-3 font-mono">{res.identifier}</td>
                            <td className="p-3">{res.type}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${
                                res.status === 'Available' ? 'bg-green-50 border-green-100 text-success' :
                                res.status === 'Deployed' ? 'bg-blue-50 border-blue-100 text-primary' :
                                'bg-yellow-50 border-yellow-100 text-warning'
                              }`}>
                                {res.status}
                              </span>
                            </td>
                            <td className="p-3 text-textMuted">{res.currentLatitude.toFixed(4)}, {res.currentLongitude.toFixed(4)}</td>
                            <td className="p-3 text-textMuted">{res.capacity}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteResource(res._id || res.id)}
                                className="text-danger hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add resource form */}
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-textMain uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>Register Response Asset</span>
                </h3>

                <form onSubmit={handleAddResource} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Asset Type</label>
                    <select
                      value={resType}
                      onChange={(e) => setResType(e.target.value)}
                      className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs font-semibold outline-none focus:border-primary transition"
                    >
                      <option value="Ambulance">Ambulance</option>
                      <option value="Boat">Rescue Boat</option>
                      <option value="Helicopter">Helicopter</option>
                      <option value="Volunteer">Volunteer Group</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Identifier / Call-sign</label>
                    <input
                      type="text"
                      value={resIdentifier}
                      onChange={(e) => setResIdentifier(e.target.value.toUpperCase())}
                      placeholder="e.g. BOAT-DELHI-04"
                      required
                      className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={resLat}
                      onChange={(e) => setResLat(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={resLng}
                      onChange={(e) => setResLng(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={resSubmitting}
                      className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {resSubmitting ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Settings and audit logs */}
            <div className="lg:col-span-4 space-y-6">
              {/* Settings panel */}
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-textMain uppercase tracking-wider flex items-center space-x-2 border-b border-veryLightGray pb-3">
                  <Cpu className="w-4 h-4 text-primary shrink-0" />
                  <span>AI Engine Configurations</span>
                </h3>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-textMain uppercase mb-1.5">Google Gemini API Key</label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2.5 bg-darkWhite border border-veryLightGray rounded-xl text-xs outline-none focus:border-primary transition"
                    />
                    <p className="text-[10px] text-textMuted mt-1 leading-normal">
                      Leave empty to run in offline/rule-based simulation mode.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Control Variables</span>
                  </button>
                </form>
              </div>

              {/* Server Audit Log */}
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-textMain uppercase tracking-wider flex items-center space-x-2 border-b border-veryLightGray pb-3">
                  <Terminal className="w-4 h-4 text-primary shrink-0" />
                  <span>Command Audit logs</span>
                </h3>

                <div className="font-mono text-[10px] space-y-3.5 max-h-48 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="text-left text-textMain leading-relaxed">
                      <span className="text-primary font-semibold">[{new Date(log.time).toLocaleTimeString()}]</span>{' '}
                      <span className="text-textMuted">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
