import React from 'react';

export default function CareerRoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">AI Career Roadmap</h1>
        <p className="text-slate-400">Specify your career goal to generate an step-by-step learning and action plan designed by AI.</p>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex gap-3">
        <input 
          type="text" 
          placeholder="e.g. Backend Developer (Spring Boot)" 
          className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100"
        />
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200">
          Generate Roadmap
        </button>
      </div>
    </div>
  );
}
