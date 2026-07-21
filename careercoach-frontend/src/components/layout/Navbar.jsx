import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30" aria-label="Top Navigation">
      {/* Left — Hamburger + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle Sidebar Menu"
          aria-expanded={false}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2 w-72 focus-within:border-indigo-500/50 focus-within:bg-slate-800 transition-all duration-200">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search features..."
            aria-label="Search features"
            className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-full"
          />
          <kbd className="hidden md:inline-flex text-[10px] text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded font-mono" aria-hidden="true">⌘K</kbd>
        </div>
      </div>

      {/* Right — Status + Notifications + User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* AI Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20" role="status" aria-label="AI System Status Online">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-400">AI Online</span>
        </div>

        {/* Notification Bell */}
        <button aria-label="View Notifications" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" aria-hidden="true"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="Open User Menu"
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white font-display uppercase" aria-hidden="true">
              {user?.username?.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">{user?.username}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.role}</p>
            </div>
            <svg className={`w-4 h-4 text-slate-500 hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 py-2 z-50" role="menu" aria-label="User Menu">
              <div className="px-4 py-3 border-b border-slate-800/80">
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button role="menuitem" onClick={() => { navigate('/profile'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus:bg-slate-800">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  My Profile
                </button>
                <button role="menuitem" onClick={() => { navigate('/settings'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus:bg-slate-800">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-800/80 py-1">
                <button role="menuitem" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors focus:bg-red-500/10">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
