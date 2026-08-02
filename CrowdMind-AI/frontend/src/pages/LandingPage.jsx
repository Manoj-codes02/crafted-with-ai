import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Cpu, 
  Map, 
  BarChart3, 
  Compass, 
  ArrowRight, 
  Users, 
  Activity, 
  FileCheck2 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-veryLightGray flex items-center justify-between px-8 md:px-16 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-textMain tracking-tight">CrowdMind AI</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-textMuted">
          <a href="#problem" className="hover:text-primary transition">The Problem</a>
          <a href="#features" className="hover:text-primary transition">Core Tech</a>
          <a href="#ai-engine" className="hover:text-primary transition">AI Insights</a>
          <a href="#or-allocation" className="hover:text-primary transition">Operations Research</a>
        </nav>
        <Link 
          to="/login" 
          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-600 shadow-md shadow-primary/20 transition-all"
        >
          Enter Command Center
        </Link>
      </header>

      {/* Hero Section */}
      <section className="px-8 md:px-16 py-16 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-primary-light border border-primary/20 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full">
            <Activity className="w-3.5 h-3.5 pulse-animation" />
            <span>Orion Global Hackathon 2026 Showcase</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-textMain tracking-tight">
            AI-Powered <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Disaster Intelligence</span> & Response Platform
          </h1>
          <p className="text-base text-textMuted leading-relaxed max-w-lg">
            CrowdMind AI aggregates chaotic disaster reports from public feeds, social media streams, and SMS reports. It uses Google Gemini and Operations Research to filter duplicates, prioritize incidents, and recommend optimized resource routing for command centers and rescue teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#features" 
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white border border-veryLightGray text-textMain font-semibold rounded-xl hover:bg-darkWhite transition"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Visual Block */}
        <div className="relative bg-white border border-veryLightGray rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-veryLightGray pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-danger"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-textMain">Active Operations Console</span>
            </div>
            <span className="text-xs text-textMuted">Delhi NCR Grid</span>
          </div>

          <div className="space-y-4">
            {/* Mock console alert */}
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3">
              <div className="p-1.5 bg-danger/10 text-danger rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-textMain">Flood: Yamuna Bank</span>
                  <span className="text-[10px] font-semibold text-danger">Priority 92%</span>
                </div>
                <p className="text-xs text-textMuted mt-1">Water level rising at 2cm/h. Rooftop rescues requested.</p>
                <div className="mt-2.5 flex items-center space-x-2 text-[10px] text-primary font-bold">
                  <span>Suggested Allocation: 2 Boats, 5 Volunteers</span>
                </div>
              </div>
            </div>

            {/* Mock console allocation */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-textMain">OR Optimization Solver</span>
                <p className="text-xs text-textMuted mt-1">Optimizing route vectors for 3 available field ambulances.</p>
                <div className="mt-2 flex items-center space-x-2 text-[10px] text-success font-semibold bg-white border border-green-200/55 rounded-md px-2 py-0.5 w-fit">
                  <span>Utilization: 78% | Avg. Distance: 3.4 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users disclaimer */}
      <section className="bg-darkWhite border-y border-veryLightGray py-12 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-bold tracking-wider uppercase text-textMuted mb-4">Command Center Platform built for</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center items-center font-semibold text-sm text-textMain">
            <span className="p-3 bg-white border border-veryLightGray rounded-xl shadow-sm">Government agencies</span>
            <span className="p-3 bg-white border border-veryLightGray rounded-xl shadow-sm">NGO Organizations</span>
            <span className="p-3 bg-white border border-veryLightGray rounded-xl shadow-sm">Rescue Teams</span>
            <span className="p-3 bg-white border border-veryLightGray rounded-xl shadow-sm">Fire Departments</span>
            <span className="p-3 bg-white border border-veryLightGray rounded-xl shadow-sm">Police Command</span>
            <span className="p-3 bg-white border border-veryLightGray rounded-xl shadow-sm">Volunteer Corps</span>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section id="features" className="px-8 md:px-16 py-20 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-textMain">Core Decision-Support Modules</h2>
          <p className="text-sm text-textMuted">Equipping disaster response managers with automated information structures to act decisively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-veryLightGray p-8 rounded-3xl space-y-4 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-red-50 text-danger w-fit rounded-2xl border border-red-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-textMain">AI Emergency Prioritization</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Analyzes incoming reports for disaster type, sentiment levels, resource needs, and extracts geolocation. Assigns a mathematical priority score.
            </p>
          </div>

          <div className="bg-white border border-veryLightGray p-8 rounded-3xl space-y-4 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-blue-50 text-primary w-fit rounded-2xl border border-blue-100">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-textMain">Duplicate Detection</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Compares coordinates of incoming alerts against active incidents. Prevents responder confusion by grouping duplicate social reports in a 1.5 km radius.
            </p>
          </div>

          <div className="bg-white border border-veryLightGray p-8 rounded-3xl space-y-4 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-green-50 text-success w-fit rounded-2xl border border-green-100">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-textMain">Operations Research Allocation</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Computes spatial distances between resources and incidents. Recommends closest compatible response assets to minimize transit time and save lives.
            </p>
          </div>
        </div>
      </section>

      {/* Critical Information Disclaimer */}
      <footer className="mt-auto bg-textMain text-white py-12 px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-danger" />
            <span className="text-lg font-bold">Important Operational Disclaimer</span>
          </div>
          <p className="text-xs text-gray-400 max-w-3xl mx-auto leading-relaxed">
            CrowdMind AI is designed strictly as a Decision Support System (DSS) for authorized emergency management centers, rescue coordinators, and volunteer groups. This platform DO NOT track cell phone logs, access telecom towers, bank databases, Aadhaar/national registries, or call private government APIs. All data represents public geolocated social reports, weather metrics, and mock data streams. It assists responders but does not directly execute rescue operations.
          </p>
          <div className="border-t border-gray-800 pt-6 text-[11px] text-gray-500">
            &copy; 2026 CrowdMind AI. Developed for Orion Global Hackathon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
