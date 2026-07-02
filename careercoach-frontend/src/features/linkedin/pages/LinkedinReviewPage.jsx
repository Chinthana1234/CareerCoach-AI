import React from 'react';

export default function LinkedinReviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">LinkedIn Optimizer</h1>
        <p className="text-slate-400">Paste your profile elements to receive optimization advice, better keywords, and headline improvements.</p>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Headline</label>
          <input 
            type="text" 
            placeholder="e.g. Computer Science Student at Stanford" 
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">About / Summary</label>
          <textarea 
            rows="4" 
            placeholder="Paste your LinkedIn summary here..." 
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100"
          ></textarea>
        </div>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200">
          Optimize Profile
        </button>
      </div>
    </div>
  );
}
