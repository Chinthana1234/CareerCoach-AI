import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-400">Track your application prep progress, recent reviews, and scheduled mock interviews.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-2">CV Score</h3>
          <p className="text-3xl font-extrabold text-indigo-400 font-display">85/100</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-2">Mock Interviews Completed</h3>
          <p className="text-3xl font-extrabold text-indigo-400 font-display">4 Sessions</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-2">LinkedIn Completeness</h3>
          <p className="text-3xl font-extrabold text-indigo-400 font-display">90%</p>
        </div>
      </div>
    </div>
  );
}
