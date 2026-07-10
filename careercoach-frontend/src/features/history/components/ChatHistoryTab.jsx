import React, { useState, useEffect } from 'react';
import { getChatSessions, deleteChatSession } from '../../../api/chatService';
import { useNavigate } from 'react-router-dom';

export default function ChatHistoryTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getChatSessions();
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load chat history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await deleteChatSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete chat session.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
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
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
          {sessions.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                No chat history found. Start a new chat!
              </td>
            </tr>
          ) : (
            sessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-400">{formatDate(session.createdAt)}</td>
                <td className="px-6 py-4 font-semibold text-white">
                  {session.title || 'Untitled Chat'}
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button 
                    onClick={() => navigate(`/chat?session=${session.id}`)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    View Chat
                  </button>
                  <button 
                    onClick={() => handleDelete(session.id)}
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
