import React, { useState } from 'react';
import { submitLinkedinReview } from '../../../api/linkedinReviewService';
import LinkedinResults from '../components/LinkedinResults';

export default function LinkedinReviewPage() {
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [experience, setExperience] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline || !about || !experience) {
      setError('Please fill in all sections.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await submitLinkedinReview(headline, about, experience);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">LinkedIn Profile Review</h1>
        <p className="text-slate-400">Optimize your LinkedIn profile with AI to increase visibility and attract recruiters.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Software Engineer | React | Node.js"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400">About Section</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Paste your current About section here..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Experience (Recent Roles)</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Paste your recent job experiences here..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              'Get AI Review'
            )}
          </button>
        </form>
      ) : (
        <LinkedinResults result={result} onReset={() => setResult(null)} />
      )}
    </div>
  );
}
