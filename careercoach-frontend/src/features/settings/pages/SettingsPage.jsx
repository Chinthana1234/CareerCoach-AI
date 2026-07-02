import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Settings</h1>
        <p className="text-slate-400">Configure application options, notification preferences, and AI settings.</p>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Account Preferences</h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-white">Email Notifications</h4>
            <p className="text-xs text-slate-400">Receive summaries of mock interview assessments</p>
          </div>
          <input type="checkbox" className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="text-sm font-semibold text-white">AI Response Verbosity</h4>
            <p className="text-xs text-slate-400">Control detailed versus summary responses in mock interviews</p>
          </div>
          <select className="px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <option>Detailed Feedback</option>
            <option>Summary Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
