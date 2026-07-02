import React from 'react';

export default function InterviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Mock Interview Practice</h1>
        <p className="text-slate-400">Choose between HR and technical tracks to start a realistic chat-based mock interview session.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-48">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">🗣️ HR Mock Interview</h3>
            <p className="text-sm text-slate-400">Prepare for behavioral questions, salary expectations, and cultural fit assessments.</p>
          </div>
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200">
            Start HR Session
          </button>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-48">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">💻 Technical Mock Interview</h3>
            <p className="text-sm text-slate-400">Practice core concepts like Java, OOP, React, SQL, and algorithm design questions.</p>
          </div>
          <button className="w-full py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all duration-200">
            Start Technical Session
          </button>
        </div>
      </div>
    </div>
  );
}
