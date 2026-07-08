import React, { useState } from 'react';

// Custom SVG Ring for Metric Scores
const MetricScoreRing = ({ score, label, colorClass }) => {
  const radius = 32;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl transition-all hover:scale-105 hover:bg-slate-950/90 duration-300">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="text-slate-800/60"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
          {/* Active progress circle */}
          <circle
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
        </svg>
        <span className="absolute font-extrabold text-base text-white">
          {score}%
        </span>
      </div>
      <span className="text-xs font-bold text-slate-400 text-center tracking-wide uppercase">{label}</span>
    </div>
  );
};

export default function InterviewResults({ session, messages, onReset }) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Large overall score configuration
  const overallRadius = 50;
  const overallStroke = 8;
  const overallNormRadius = overallRadius - overallStroke * 2;
  const overallCircumference = overallNormRadius * 2 * Math.PI;
  const overallOffset = overallCircumference - (session.overallScore / 100) * overallCircumference;

  const isTechnical = session.interviewType === 'TECHNICAL';

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Performance Evaluation</h1>
          <p className="text-slate-400">
            {isTechnical 
              ? <>Technical assessment for topic: <span className="text-indigo-400 font-semibold">{session.topic}</span></>
              : <>Mock interview assessment for <span className="text-indigo-400 font-semibold">{session.jobTitle}</span></>
            }
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          Start New Practice
        </button>
      </div>

      {/* Main Results Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Overall Score Wheel */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Overall Score</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Glowing background ring */}
            <div className="absolute inset-2 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-slate-800/80"
                strokeWidth={overallStroke}
                stroke="currentColor"
                fill="transparent"
                r={overallNormRadius}
                cx="72"
                cy="72"
              />
              <circle
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth={overallStroke}
                strokeDasharray={`${overallCircumference} ${overallCircumference}`}
                style={{ strokeDashoffset: overallOffset }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={overallNormRadius}
                cx="72"
                cy="72"
              />
            </svg>
            <span className="absolute font-black text-3xl text-white">
              {session.overallScore}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            {isTechnical
              ? "Overall assessment calculation based on Confidence, Grammar, Communication, and Technical Accuracy criteria."
              : "Overall assessment calculation based on Confidence, Grammar, Communication, and Professionalism criteria."
            }
          </p>
        </div>

        {/* Right Section: 4 Metric Cards */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricScoreRing 
            score={session.confidenceScore} 
            label="Confidence" 
            colorClass="text-emerald-500" 
          />
          <MetricScoreRing 
            score={session.grammarScore} 
            label="Grammar" 
            colorClass="text-sky-500" 
          />
          <MetricScoreRing 
            score={session.communicationScore} 
            label="Communication" 
            colorClass="text-amber-500" 
          />
          <MetricScoreRing 
            score={session.professionalismScore} 
            label={isTechnical ? "Technical Accuracy" : "Professionalism"} 
            colorClass="text-indigo-500" 
          />
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📝</span> {isTechnical ? "Technical Expert Feedback & Summary" : "HR Expert Feedback & Summary"}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{session.feedback}</p>
      </div>

      {/* Transcript Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors focus:outline-none"
        >
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <span>💬</span> View Dialogue Transcript
          </span>
          <span className="text-slate-400 text-sm font-semibold">
            {showTranscript ? 'Hide ▴' : 'Show ▾'}
          </span>
        </button>

        {showTranscript && (
          <div className="border-t border-slate-800 bg-slate-950 p-6 space-y-4 max-h-[30rem] overflow-y-auto">
            {messages
              .filter(msg => msg.content && !msg.content.includes("Thank you for completing the interview!"))
              .map((msg, index) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isAI ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {isAI ? '🤖' : '👤'}
                    </div>
                    <div className={`p-4 rounded-xl ${
                      isAI 
                        ? 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none' 
                        : 'bg-indigo-650/40 border border-indigo-500/20 text-white rounded-tr-none'
                    }`}>
                      <p className="text-xs font-semibold text-slate-400 mb-1">{isAI ? 'AI Interviewer' : 'Your Answer'}</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
