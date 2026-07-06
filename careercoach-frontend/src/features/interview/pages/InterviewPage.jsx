import React, { useState, useEffect, useRef } from 'react';
import { startInterview, submitAnswer, getInterviewMessages } from '../../../api/interviewService';
import InterviewResults from '../components/InterviewResults';

const JOB_PRESETS = [
  { id: 'swe', title: 'Software Engineer', icon: '💻' },
  { id: 'pm', title: 'Product Manager', icon: '💼' },
  { id: 'ds', title: 'Data Scientist', icon: '📊' },
  { id: 'ux', title: 'UX Designer', icon: '🎨' },
  { id: 'ba', title: 'Business Analyst', icon: '📈' },
];

export default function InterviewPage() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [answerText, setAnswerText] = useState('');
  
  // Loading & state management
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartSession = async (role) => {
    const roleTitle = role === 'custom' ? customRole.trim() : role;
    if (!roleTitle) {
      setError('Please specify a job title to start the interview.');
      return;
    }

    try {
      setStarting(true);
      setError(null);
      const res = await startInterview(roleTitle);
      const newSession = res.data;
      setSession(newSession);

      // Load initial message
      const msgRes = await getInterviewMessages(newSession.id);
      setMessages(msgRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to start the interview session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || submitting) return;

    const currentAnswer = answerText.trim();
    setAnswerText('');
    setSubmitting(true);
    setError(null);

    // Optimistically add user message to chat UI
    const optimisticUserMsg = {
      id: Date.now(),
      sender: 'USER',
      content: currentAnswer,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const res = await submitAnswer(session.id, currentAnswer);
      const updatedSession = res.data;
      setSession(updatedSession);

      // Fetch refreshed dialogue history
      const msgRes = await getInterviewMessages(updatedSession.id);
      setMessages(msgRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to submit your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSession(null);
    setMessages([]);
    setSelectedRole('');
    setCustomRole('');
    setAnswerText('');
    setError(null);
  };

  // If a session exists and is completed, render the results view
  if (session && session.status === 'COMPLETED') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <InterviewResults session={session} messages={messages} onReset={handleReset} />
      </div>
    );
  }

  // Active HR Interview chat room
  if (session) {
    const currentQuestionNumber = session.currentQuestionIndex + 1;
    const progressPercent = Math.min(((session.currentQuestionIndex) / 4) * 100, 100);

    return (
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Active Header */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-t-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xl">🗣️</span>
            <div>
              <h2 className="text-lg font-bold text-white">HR Interview Practice</h2>
              <p className="text-xs text-slate-400">Target Role: <span className="text-indigo-400 font-semibold">{session.jobTitle}</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-semibold text-slate-400">Question {Math.min(currentQuestionNumber, 4)} of 4</span>
            <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 border-x border-slate-800 space-y-6">
          {messages.map((msg) => {
            const isAI = msg.sender === 'AI';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${
                  isAI ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {isAI ? '🤖' : '👤'}
                </div>
                <div className={`p-4 rounded-2xl ${
                  isAI 
                    ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none' 
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {submitting && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-sm">
                🤖
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs text-center">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <form 
          onSubmit={handleSubmitAnswer}
          className="p-4 bg-slate-900 border border-slate-800 rounded-b-2xl flex gap-3"
        >
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitAnswer(e);
              }
            }}
            placeholder="Type your response here... (Press Enter to send)"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none h-12"
          />
          <button
            type="submit"
            disabled={!answerText.trim() || submitting}
            className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0"
          >
            Send Response
          </button>
        </form>
      </div>
    );
  }

  // Landing Stage: Role Selection
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Mock Interview Practice</h1>
        <p className="text-slate-400">Improve your communication, grammar, confidence, and professionalism with AI-powered mock interviews.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">🗣️ HR Interview Setup</h2>
          <p className="text-sm text-slate-400">Select your target career track to calibrate standard HR questions and behavioral prompts.</p>
        </div>

        {/* Grid of presets */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {JOB_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedRole(preset.title);
                setError(null);
              }}
              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedRole === preset.title
                  ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl">{preset.icon}</span>
              <span className="text-xs font-semibold text-center leading-snug">{preset.title}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedRole('custom');
              setError(null);
            }}
            className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
              selectedRole === 'custom'
                ? 'bg-indigo-600/10 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs font-semibold text-center leading-snug">Custom Role</span>
          </button>
        </div>

        {/* Custom Input Field */}
        {selectedRole === 'custom' && (
          <div className="space-y-2 animate-fadeIn">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role Title</label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Developer, DevOps Engineer..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <button
          onClick={() => handleStartSession(selectedRole)}
          disabled={!selectedRole || (selectedRole === 'custom' && !customRole.trim()) || starting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2"
        >
          {starting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Initializing AI Session...
            </>
          ) : (
            'Start Mock Interview Session'
          )}
        </button>
      </div>
    </div>
  );
}
