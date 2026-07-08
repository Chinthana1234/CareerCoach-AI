import React from 'react';

export default function LinkedinResults({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Review Results</h2>
      <button onClick={onReset} className="text-indigo-400 text-sm hover:underline">Review Another</button>
    </div>
  );
}
