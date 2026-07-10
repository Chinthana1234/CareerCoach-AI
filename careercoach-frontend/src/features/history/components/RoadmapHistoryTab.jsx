import React, { useState, useEffect } from 'react';
import { getRoadmapHistory } from '../../../api/roadmapService';
import { useNavigate } from 'react-router-dom';

export default function RoadmapHistoryTab() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await getRoadmapHistory();
      setRoadmaps(res.data || res); // Depending on axios structure
    } catch (err) {
      console.error(err);
      setError("Failed to load roadmap history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await import('../../../api/roadmapService').then(m => m.deleteRoadmap(id));
      setRoadmaps(roadmaps.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete roadmap.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 m-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Target Role</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
          {roadmaps.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                No career roadmaps found. Generate one today!
              </td>
            </tr>
          ) : (
            roadmaps.map((roadmap) => (
              <tr key={roadmap.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-400">{formatDate(roadmap.createdAt)}</td>
                <td className="px-6 py-4 font-semibold text-white">
                  {roadmap.targetRole || 'Career Roadmap'}
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button 
                    onClick={() => navigate(`/roadmap?id=${roadmap.id}`)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    View Roadmap
                  </button>
                  <button 
                    onClick={() => handleDelete(roadmap.id)}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
