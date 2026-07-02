import React from 'react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-905 border border-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold font-display text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm mb-6">Sign in to your CareerCoach AI account</p>
        <div className="text-xs text-slate-500 border border-dashed border-slate-700 p-4 rounded-lg text-center">
          Authentication: Login form will be implemented here.
        </div>
      </div>
    </div>
  );
}
