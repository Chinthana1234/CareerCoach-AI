import React, { useState, useEffect } from 'react';
import { generateRoadmap, getRoadmapHistory } from '../../../api/roadmapService';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'AI Engineer',
];

export default function CareerRoadmapPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'history'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getRoadmapHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setActiveRoadmap(null);
    try {
      const data = await generateRoadmap(selectedRole);
      setActiveRoadmap({
        ...data,
        timeline: JSON.parse(data.timelineJson || '[]'),
        projects: JSON.parse(data.projectsJson || '[]'),
      });
      fetchHistory(); // Refresh history
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewHistoryItem = (item) => {
    setActiveRoadmap({
      ...item,
      timeline: JSON.parse(item.timelineJson || '[]'),
      projects: JSON.parse(item.projectsJson || '[]'),
    });
    setActiveTab('generator'); // switch to generator tab to view it
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">AI Career Roadmap</h1>
        <p className="text-slate-400">Generate a step-by-step learning and action plan designed by AI.</p>
      </div>

      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'generator' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Generator
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          History
        </button>
      </div>

      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all duration-200"
            >
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>

          {error && <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm">{error}</div>}

          {activeRoadmap && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <h2 className="text-2xl font-bold text-white">Timeline for {activeRoadmap.role}</h2>
                <div className="relative border-l border-slate-700 ml-3 space-y-8">
                  {Array.isArray(activeRoadmap.timeline) && activeRoadmap.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900"></span>
                      <h3 className="text-lg font-semibold text-white">{item.month} <span className="text-indigo-400">- {item.focus}</span></h3>
                      <p className="mt-1 text-slate-400 text-sm">{item.description}</p>
                      {item.skills && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-md">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
                <h2 className="text-2xl font-bold text-white">Recommended Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(activeRoadmap.projects) && activeRoadmap.projects.map((proj, idx) => (
                    <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{proj.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold rounded bg-slate-800 text-slate-400">
                          {proj.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No roadmaps generated yet.</div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{item.role} Roadmap</h3>
                  <p className="text-xs text-slate-500 mt-1">Generated on: {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => viewHistoryItem(item)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
