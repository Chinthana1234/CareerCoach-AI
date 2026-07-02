import React from 'react';

export default function CvReviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">AI CV Review</h1>
        <p className="text-slate-400">Upload your CV in PDF format to get instant feedback and scoring from our AI engine.</p>
      </div>
      <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50 flex flex-col items-center justify-center gap-4 text-center">
        <span className="text-4xl">📄</span>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Upload CV Document</h3>
          <p className="text-sm text-slate-400">Support PDF format up to 5MB</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200">
          Choose File
        </button>
      </div>
    </div>
  );
}
