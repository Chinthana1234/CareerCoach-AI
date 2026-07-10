import React, { useState, useEffect, useMemo } from 'react';
import { getInterviewHistory } from '../../../api/interviewService';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

export default function InterviewHistoryTab() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await getInterviewHistory();
      setInterviews(res.data || res);
    } catch (err) {
      console.error(err);
      setError("Failed to load interview history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview session?")) return;
    try {
      await import('../../../api/interviewService').then(m => m.deleteInterview(id));
      const updatedInterviews = interviews.filter(i => i.id !== id);
      setInterviews(updatedInterviews);
      const maxPage = Math.ceil(updatedInterviews.length / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) setCurrentPage(maxPage);
    } catch (err) {
      console.error(err);
      alert("Failed to delete interview session.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const filteredInterviews = useMemo(() => {
    if (!searchQuery) return interviews;
    const lowerQuery = searchQuery.toLowerCase();
    return interviews.filter(i => 
      (i.topic && i.topic.toLowerCase().includes(lowerQuery)) ||
      (i.jobTitle && i.jobTitle.toLowerCase().includes(lowerQuery)) ||
      (i.interviewType && i.interviewType.toLowerCase().includes(lowerQuery))
    );
  }, [interviews, searchQuery]);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInterviews = filteredInterviews.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="overflow-x-auto">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search by topic, role, or type..." 
        />
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Topic / Role</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
            {currentInterviews.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  No mock interviews found. Start practicing today!
                </td>
              </tr>
            ) : (
              currentInterviews.map((session) => {
                const isTech = session.interviewType === 'TECHNICAL';
                return (
                  <tr key={session.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-400">{formatDate(session.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        isTech
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {isTech ? 'Technical' : 'HR Mock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {isTech ? session.topic : session.jobTitle}
                    </td>
                    <td className="px-6 py-4">
                      {session.status === 'COMPLETED' ? (
                        <span className="text-emerald-400 font-extrabold">{session.overallScore} / 100</span>
                      ) : (
                        <span className="text-amber-400 font-bold italic">In Progress</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button 
                        onClick={() => navigate(`/interview`)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                      >
                        {session.status === 'COMPLETED' ? 'View Details' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => handleDelete(session.id)}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredInterviews.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredInterviews.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
