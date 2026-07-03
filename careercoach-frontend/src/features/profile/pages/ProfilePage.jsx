import React from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 mt-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white font-display uppercase shadow-xl ring-4 ring-slate-900">
            {user?.username?.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-white font-display">{user?.username}</h1>
            <p className="text-indigo-400 font-medium mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-3">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                {user?.role || 'USER'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                Free Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">👤</span> Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Username</p>
              <p className="text-sm text-slate-200 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">{user?.username}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-sm text-slate-200 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">🔒</span> Security
          </h2>
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
              <p className="text-sm font-semibold text-white">Change Password</p>
              <p className="text-xs text-slate-400 mt-0.5">Update your password to keep your account secure.</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
              <p className="text-sm font-semibold text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
