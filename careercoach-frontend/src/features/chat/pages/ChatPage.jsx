import React from 'react';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80">
        <h2 className="text-xl font-bold font-display text-white">AI Career Assistant</h2>
        <p className="text-xs text-slate-400">Ask me anything about career options, job prep, or interview strategies.</p>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 max-w-[80%]">
          <p className="text-sm text-slate-200">Hello! I'm your AI career coach. How can I help you today?</p>
        </div>
      </div>
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex gap-3">
        <input 
          type="text" 
          placeholder="Ask a question..." 
          className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100"
        />
        <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200">
          Send
        </button>
      </div>
    </div>
  );
}
