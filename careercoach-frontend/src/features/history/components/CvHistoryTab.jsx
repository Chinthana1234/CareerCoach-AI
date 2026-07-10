import React, { useState, useEffect } from 'react';
import { getAllCvReviews, getLatestCvReview } from '../../../api/cvService';
import { useNavigate } from 'react-router-dom';

export default function CvHistoryTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Attempt to get all reviews (endpoint will be ready after Commit 4)
      try {
        const res = await getAllCvReviews();
        setReviews(res.data || res);
      } catch (err) {
        // Fallback to latest cv review if all endpoint 404s
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

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this CV review?")) return;
    setReviews(reviews.filter(r => r.id !== id));
    alert("CV review deleted from view (Backend integration pending in Step 4/5).");
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
            <th className="px-6 py-4">Review Type</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                No CV reviews found. Upload a CV to get started!
              </td>
            </tr>
          ) : (
            reviews.map((review) => (
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
  );
}
