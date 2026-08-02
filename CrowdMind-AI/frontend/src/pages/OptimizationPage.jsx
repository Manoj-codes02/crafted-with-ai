import React, { useState, useEffect } from 'react';
import API from '../utils/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import LiveMap from '../components/LiveMap.jsx';
import { 
  Cpu, 
  Play, 
  Send, 
  Activity, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckSquare 
} from 'lucide-react';

const OptimizationPage = () => {
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const incRes = await API.get('/incidents');
      const resRes = await API.get('/resources');
      setIncidents(incRes.data);
      setResources(resRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleRunSolver = async () => {
    setLoading(true);
    setDispatchSuccess(false);
    try {
      const response = await API.get('/or/optimize');
      if (response.data.success) {
        setOptimizationResult(response.data);
      }
    } catch (err) {
      console.error('Error running OR solver:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDispatch = async () => {
    if (!optimizationResult || optimizationResult.allocations.length === 0) return;
    
    setLoading(true);
    try {
      const response = await API.post('/or/dispatch', {
        allocations: optimizationResult.allocations
      });
      if (response.data.success) {
        setDispatchSuccess(true);
        setOptimizationResult(null); // Clear suggestions as they are now active
        fetchInitialData(); // Reload updated resources/incidents
      }
    } catch (err) {
      console.error('Error dispatching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeAllocations = optimizationResult?.allocations || [];
  const stats = optimizationResult?.stats || null;

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
                <Cpu className="w-5 h-5 text-primary shrink-0" />
                <span>Operations Research Routing Solver</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">Minimize estimated emergency transit times using proximity vectors and priority queues.</p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleRunSolver}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-600 shadow-md shadow-primary/10 transition disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{loading ? 'Solving Constraints...' : 'Run Optimization Solver'}</span>
              </button>
            </div>
          </div>

          {/* Success Notification */}
          {dispatchSuccess && (
            <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
              <CheckSquare className="w-5 h-5" />
              <span>Bulk Dispatch Executed successfully! Emergency assets mobilized and incident status tags updated.</span>
            </div>
          )}

          {/* Core Optimization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Spatial Routing Visualization */}
            <div className="lg:col-span-8 space-y-6">
              <div className="h-[480px]">
                <LiveMap 
                  incidents={incidents} 
                  resources={resources} 
                  routeLines={activeAllocations} 
                />
              </div>

              {/* Solver stats if available */}
              {stats && (
                <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-textMain uppercase tracking-wider mb-4">Optimization Solver Performance metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-darkWhite border border-veryLightGray rounded-xl text-center">
                      <p className="text-[10px] font-bold text-textMuted uppercase">Utilization Rate</p>
                      <p className="text-lg font-bold text-primary mt-1">{stats.resourceUtilizationPercent}%</p>
                    </div>
                    <div className="p-3 bg-darkWhite border border-veryLightGray rounded-xl text-center">
                      <p className="text-[10px] font-bold text-textMuted uppercase">Avg. Response Time</p>
                      <p className="text-lg font-bold text-success mt-1">{stats.avgEstResponseTimeMinutes} mins</p>
                    </div>
                    <div className="p-3 bg-darkWhite border border-veryLightGray rounded-xl text-center">
                      <p className="text-[10px] font-bold text-textMuted uppercase">Total Distance</p>
                      <p className="text-lg font-bold text-textMain mt-1">{stats.totalOptimizedDistanceKm} km</p>
                    </div>
                    <div className="p-3 bg-darkWhite border border-veryLightGray rounded-xl text-center">
                      <p className="text-[10px] font-bold text-textMuted uppercase">Allocated Units</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">{stats.allocatedResourcesCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Allocation Lists */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm">
                <div className="border-b border-veryLightGray pb-3.5 mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-textMain uppercase tracking-wider">Suggested Matches</h3>
                  {activeAllocations.length > 0 && (
                    <button
                      onClick={handleExecuteDispatch}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-success text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Dispatch</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {activeAllocations.length === 0 ? (
                    <div className="py-12 text-center text-xs text-textMuted font-semibold">
                      <Activity className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                      No routes suggestions. Click "Run Optimization Solver" to compute allocation solutions.
                    </div>
                  ) : (
                    activeAllocations.map((alloc, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 bg-darkWhite border border-veryLightGray rounded-xl space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                              {alloc.resourceType}
                            </span>
                            <h4 className="text-xs font-bold text-textMain mt-1">{alloc.resourceIdentifier}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-danger uppercase tracking-wider bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                              Match: {alloc.incidentPriorityScore}%
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1.5 border-t border-veryLightGray/65 pt-2">
                          <p className="text-textMuted font-medium truncate">🎯 Target: {alloc.incidentTitle}</p>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-textMuted">
                            <span className="flex items-center space-x-1">
                              <Navigation className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Distance: {alloc.distanceKm} km</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Transit: {alloc.estTimeMinutes} min</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OptimizationPage;
