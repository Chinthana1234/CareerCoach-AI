import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const quickActions = [
  {
    title: 'AI Chatbot',
    description: 'Get instant career advice from our AI assistant',
    path: '/chat',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'CV Review',
    description: 'Upload your CV for AI-powered feedback and scoring',
    path: '/cv-review',
    gradient: 'from-indigo-500 to-purple-500',
    shadow: 'shadow-indigo-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Mock Interview',
    description: 'Practice HR and technical interviews with AI feedback',
    path: '/interview',
    gradient: 'from-orange-500 to-rose-500',
    shadow: 'shadow-orange-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: 'LinkedIn Optimizer',
    description: 'Improve your headline, summary and profile keywords',
    path: '/linkedin',
    gradient: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Career Roadmap',
    description: 'Generate a personalized step-by-step career plan',
    path: '/roadmap',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'History',
    description: 'View your past reviews, interviews and chat logs',
    path: '/history',
    gradient: 'from-violet-500 to-fuchsia-500',
    shadow: 'shadow-violet-500/20',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const stats = [
  { label: 'CV Score', value: '—', sub: 'Upload to get scored', color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: '📄' },
  { label: 'Interviews', value: '0', sub: 'Sessions completed', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: '🎙️' },
  { label: 'Chat Sessions', value: '0', sub: 'Conversations', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '💬' },
  { label: 'Roadmaps', value: '0', sub: 'Plans generated', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '🗺️' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome + Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-black rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-black font-display uppercase border border-black/10">
              {user?.username?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-black tracking-tight">
                {getGreeting()}, {user?.username} 👋
              </h1>
              <p className="text-black/70 text-sm mt-0.5">
                Ready to level up your career? Pick an action below to get started.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="self-start sm:self-center px-5 py-2.5 bg-black/10 hover:bg-black/20 backdrop-blur-sm text-black text-sm font-bold rounded-xl border border-black/10 transition-all duration-200"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-2xl w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>{stat.icon}</span>
            </div>
            <p className={`text-3xl font-extrabold font-display ${stat.color}`}>{stat.value}</p>
            <p className="text-sm font-semibold text-white mt-1">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold font-display text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`group relative overflow-hidden bg-slate-900 border border-slate-800/80 rounded-2xl p-5 text-left hover:border-slate-700 transition-all duration-300 hover:shadow-xl ${action.shadow}`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-4 shadow-lg ${action.shadow}`}>
                {action.icon}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{action.title}</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{action.description}</p>
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
