import React from 'react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Your Profile</h1>
        <p className="text-slate-400">Manage your personal information, career interests, and skills profile.</p>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white font-display">
            JD
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">John Doe</h3>
            <p className="text-sm text-slate-400">Computer Science Graduate</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input type="email" readOnly value="john.doe@university.edu" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Target Job Role</label>
            <input type="text" readOnly value="Software Engineer" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
