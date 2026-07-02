import React from 'react';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Your History</h1>
        <p className="text-slate-400">View your past CV reviews, mock interview transcripts, and chat logs.</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Title / Topic</th>
              <th className="px-6 py-4">Score / Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
            <tr>
              <td className="px-6 py-4 text-slate-500">2026-07-02</td>
              <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">CV Review</span></td>
              <td className="px-6 py-4">Software Engineering CV (v1.0)</td>
              <td className="px-6 py-4 text-emerald-400 font-bold">85 / 100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
