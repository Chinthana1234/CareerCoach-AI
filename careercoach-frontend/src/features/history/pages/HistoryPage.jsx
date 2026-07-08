import React, { useState, useEffect } from 'react';
import { getInterviewHistory } from '../../../api/interviewService';
import { getLatestCvReview } from '../../../api/cvService';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [latestCv, setLatestCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal viewer state
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Load mock interviews
        const interviewRes = await getInterviewHistory();
        setInterviews(interviewRes.data);
        
        // Load latest CV review
        try {
          const cvRes = await getLatestCvReview();
          setLatestCv(cvRes.data);
        } catch (cvErr) {
          // If no CV reviews exist, fail silently as it's optional
          console.log("No CV reviews found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Your History</h1>
        <p className="text-slate-400">View your past CV assessments and detailed AI mock interview transcripts.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Title / Topic</th>
                <th className="px-6 py-4">Score / Outcome</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
              {/* Render Latest CV Review if available */}
              {latestCv && (
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-400">{formatDate(latestCv.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      CV Review
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">ATS CV Optimization Review</td>
                  <td className="px-6 py-4 text-emerald-400 font-extrabold">{latestCv.overallScore} / 100</td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href="/cv-review" 
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Open Dashboard
                    </a>
                  </td>
                </tr>
              )}

              {/* Render Mock Interviews */}
              {interviews.map((session) => {
                const isTech = session.interviewType === 'TECHNICAL';
                return (
                  <tr 
                    key={session.id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-400">{formatDate(session.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        isTech
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {isTech ? 'Technical' : 'Mock Interview'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {isTech 
                        ? `💻 Technical Interview (${session.topic})` 
                        : `🗣️ HR Mock Interview (${session.jobTitle})`
                      }
                    </td>
                    <td className="px-6 py-4">
                      {session.status === 'COMPLETED' ? (
                        <span className="text-emerald-400 font-extrabold">{session.overallScore} / 100</span>
                      ) : (
                        <span className="text-amber-400 font-bold italic">In Progress</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {session.status === 'COMPLETED' ? (
                        <button 
                          onClick={() => setSelectedSession(session)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                        >
                          View Assessment
                        </button>
                      ) : (
                        <a 
                          href="/interview" 
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                        >
                          Resume Session
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {!latestCv && interviews.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No history found. Try uploading a CV or practicing an HR interview first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal View for detailed mock interview assessment */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedSession.interviewType === 'TECHNICAL' ? 'Technical Interview Assessment' : 'HR Interview Assessment'}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSession.interviewType === 'TECHNICAL' ? 'Topic: ' : 'Target Role: '}
                  <span className="text-indigo-400 font-semibold">
                    {selectedSession.interviewType === 'TECHNICAL' ? selectedSession.topic : selectedSession.jobTitle}
                  </span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-slate-200 text-2xl font-semibold leading-none focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Overall & metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/40 p-4 border border-slate-800/60 rounded-xl">
                <div className="flex flex-col justify-center items-center sm:items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Overall Score</span>
                  <span className="text-4xl font-black text-indigo-400">{selectedSession.overallScore} <span className="text-lg text-slate-500">/100</span></span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold mb-0.5">Confidence</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedSession.confidenceScore}%</span>
                  </div>
                  <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold mb-0.5">Grammar</span>
                    <span className="text-sky-400 font-bold text-sm">{selectedSession.grammarScore}%</span>
                  </div>
                  <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold mb-0.5">Communication</span>
                    <span className="text-amber-400 font-bold text-sm">{selectedSession.communicationScore}%</span>
                  </div>
                  <div className="flex flex-col bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold mb-0.5">
                      {selectedSession.interviewType === 'TECHNICAL' ? 'Technical Accuracy' : 'Professionalism'}
                    </span>
                    <span className="text-indigo-400 font-bold text-sm">{selectedSession.professionalismScore}%</span>
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Expert Feedback Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 border border-slate-800/40 rounded-xl whitespace-pre-wrap">{selectedSession.feedback}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button 
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors focus:outline-none"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
