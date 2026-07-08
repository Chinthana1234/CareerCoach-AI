import React from 'react';

export default function LinkedinResults({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          ✨ Your Optimized LinkedIn Profile
        </h2>
        <button 
          onClick={onReset} 
          className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors"
        >
          Review Another Profile
        </button>
      </div>

      {/* Suggestions Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200">Actionable Suggestions</h3>
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {result.suggestions}
          </p>
        </div>
      </div>

      {/* Improved Profile Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200">Improved Profile (Ready to Copy)</h3>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative group">
          <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
            {result.improvedProfile}
          </p>
          <button 
            onClick={() => navigator.clipboard.writeText(result.improvedProfile)}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
