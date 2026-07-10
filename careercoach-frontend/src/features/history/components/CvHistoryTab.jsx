import React, { useState, useEffect, useMemo } from 'react';
import { getAllCvReviews, getLatestCvReview } from '../../../api/cvService';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

export default function CvHistoryTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      try {
        const res = await getAllCvReviews();
        setReviews(res.data || res);
      } catch (err) {
        const fallbackRes = await getLatestCvReview();
        if (fallbackRes.data) {
          setReviews([fallbackRes.data]);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load CV review history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this CV review?")) return;
    try {
      await import('../../../api/cvService').then(m => m.deleteCvReview(id));
      const updatedReviews = reviews.filter(r => r.id !== id);
      setReviews(updatedReviews);
      const maxPage = Math.ceil(updatedReviews.length / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) setCurrentPage(maxPage);
    } catch (err) {
      console.error(err);
      alert("Failed to delete CV review.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const filteredReviews = useMemo(() => {
    if (!searchQuery) return reviews;
    // In CV history, maybe search by ID or type (since CV has less text fields right now).
    // Let's filter by the score as string or type.
    return reviews.filter(r => 
      'cv review'.includes(searchQuery.toLowerCase()) || 
      (r.overallScore && r.overallScore.toString().includes(searchQuery))
    );
  }, [reviews, searchQuery]);

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
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="overflow-x-auto">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search by score or type..." 
        />
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Review Type</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
            {currentReviews.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                  No CV reviews found. Upload a CV to get started!
                </td>
              </tr>
            ) : (
              currentReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-400">{formatDate(review.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      CV Review
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-extrabold">{review.overallScore} / 100</td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button 
                      onClick={() => navigate(`/cv-review`)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                    >
                      View Dashboard
                    </button>
                    <button 
                      onClick={() => handleDelete(review.id)}
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

      {filteredReviews.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredReviews.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
