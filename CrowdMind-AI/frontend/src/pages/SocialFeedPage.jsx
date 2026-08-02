import React, { useState, useEffect } from 'react';
import API from '../utils/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  Radio, 
  Sparkles, 
  Send, 
  MapPin, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  CheckCircle,
  Globe,
  MessageSquare
} from 'lucide-react';


const SocialFeedPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extractions, setExtractions] = useState({}); // Stores AI results per post id
  const [processingId, setProcessingId] = useState(null);
  const [promotedIds, setPromotedIds] = useState(new Set());

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await API.get('/ai/social-feed');
      setFeeds(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching social feed:', err);
      setLoading(false);
    }
  };

  const handleAITriage = async (post) => {
    setProcessingId(post.id);
    try {
      const response = await API.post('/ai/analyze', {
        text: post.text,
        latitude: post.lat,
        longitude: post.lng
      });
      setExtractions(prev => ({
        ...prev,
        [post.id]: response.data
      }));
    } catch (err) {
      console.error('Error extracting AI details:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePromoteToIncident = async (post, aiDetails) => {
    setProcessingId(post.id);
    try {
      await API.post('/incidents', {
        title: `Reported ${aiDetails.type} at ${post.location}`,
        description: post.text,
        locationName: post.location,
        latitude: post.lat,
        longitude: post.lng,
        source: post.platform === 'Twitter' ? 'Twitter' : post.platform === 'Facebook' ? 'Facebook' : 'SMS',
        reporterName: post.user
      });
      
      setPromotedIds(prev => {
        const next = new Set(prev);
        next.add(post.id);
        return next;
      });
    } catch (err) {
      console.error('Error promoting incident:', err);
    } finally {
      setProcessingId(null);
    }
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
                <Radio className="w-5 h-5 text-primary shrink-0 pulse-animation" />
                <span>Social Media Triage Center</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">Parse public feeds and SMS traffic using AI. Detect crisis events, extract geolocations, and compile tickets.</p>
            </div>
          </div>

          {/* Social Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Feed List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-textMain uppercase tracking-wider mb-2">Simulated Incoming Streams</h3>
              {loading ? (
                <div className="py-12 bg-white border border-veryLightGray rounded-2xl text-center text-xs text-textMuted">
                  Polling social gateways...
                </div>
              ) : (
                feeds.map((post) => {
                  const aiResult = extractions[post.id];
                  const isPromoted = promotedIds.has(post.id);
                  return (
                    <div 
                      key={post.id}
                      className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition"
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
                          {post.platform === 'Twitter' ? (
                            <div className="p-1.5 bg-sky-50 text-sky-500 rounded-lg"><MessageSquare className="w-4 h-4" /></div>
                          ) : post.platform === 'Facebook' ? (
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Globe className="w-4 h-4" /></div>
                          ) : (
                            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><MessageSquare className="w-4 h-4" /></div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-textMain">{post.user}</span>
                            <span className="text-[10px] text-textMuted ml-2">via {post.platform}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-textMuted font-semibold">{new Date(post.timestamp).toLocaleTimeString()}</span>
                      </div>

                      {/* Text content */}
                      <p className="text-xs text-textMain leading-relaxed font-medium">"{post.text}"</p>

                      {/* Metadata location */}
                      <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-textMuted bg-darkWhite w-fit px-2.5 py-1 rounded-md border border-veryLightGray">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Coordinate detected: {post.location} ({post.lat}, {post.lng})</span>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-veryLightGray/70 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <button
                          onClick={() => handleAITriage(post)}
                          disabled={processingId === post.id || aiResult}
                          className="inline-flex items-center space-x-1.5 px-4.5 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary-light transition disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{processingId === post.id ? 'Running NLP...' : aiResult ? 'AI Analysis Complete' : 'Run AI Extraction'}</span>
                        </button>

                        {aiResult && !isPromoted && (
                          <button
                            onClick={() => handlePromoteToIncident(post, aiResult)}
                            disabled={processingId === post.id}
                            className="inline-flex items-center space-x-1.5 px-4.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-600 shadow-sm transition disabled:opacity-50"
                          >
                            <span>Promote to Incident Ticket</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isPromoted && (
                          <div className="flex items-center space-x-1 text-xs font-bold text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span>Incident Created & Pinned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* AI Output details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-textMain uppercase tracking-wider mb-2">Extraction Inspector</h3>
              {Object.keys(extractions).length === 0 ? (
                <div className="bg-white border border-veryLightGray rounded-2xl p-8 text-center text-xs text-textMuted">
                  Select "Run AI Extraction" on any social post to review NLP classification payloads.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(extractions).map((postId) => {
                    const post = feeds.find(f => f.id === postId);
                    const aiResult = extractions[postId];
                    if (!post) return null;
                    return (
                      <div 
                        key={postId}
                        className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm text-left space-y-3.5 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center border-b border-veryLightGray pb-3">
                          <span className="text-xs font-bold text-textMain">Triage Report: {post.user}</span>
                          <span className="text-[10px] font-bold uppercase text-primary tracking-wide">Gemini response</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-textMuted uppercase mb-0.5">Classification Type</p>
                            <p className="font-semibold text-textMain">{aiResult.type}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-textMuted uppercase mb-0.5">Priority Urgency</p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase mt-0.5 ${
                              aiResult.priority === 'High' ? 'bg-red-50 border-red-100 text-danger' : 'bg-yellow-50 border-yellow-100 text-warning'
                            }`}>
                              {aiResult.priority} ({aiResult.priorityScore}%)
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] font-bold text-textMuted uppercase mb-0.5">Needs Extracted</p>
                            <p className="font-semibold text-primary">{aiResult.needs}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-textMuted uppercase mb-0.5">Sentiment</p>
                            <p className="font-semibold text-textMain">{aiResult.sentiment || 'Anxious'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-textMuted uppercase mb-0.5">Duplicate Incident Status</p>
                            <p className={`font-semibold ${aiResult.duplicateOfIncidentId ? 'text-purple-600' : 'text-success'}`}>
                              {aiResult.duplicateOfIncidentId ? `Duplicate Found (${aiResult.duplicateOfIncidentId})` : 'New Unique Incident'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialFeedPage;
