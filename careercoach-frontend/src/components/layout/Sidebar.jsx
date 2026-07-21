import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const mainMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
    </svg>
  )},
  { name: 'AI Chatbot', path: '/chat', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )},
  { name: 'CV Review', path: '/cv-review', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { name: 'Mock Interview', path: '/interview', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )},
  { name: 'LinkedIn Optimizer', path: '/linkedin', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )},
  { name: 'Career Roadmap', path: '/roadmap', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )},
];

const bottomMenuItems = [
  { name: 'History', path: '/history', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { name: 'Profile', path: '/profile', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
  { name: 'Settings', path: '/settings', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
];

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
        }`
      }
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span>{item.name}</span>
    </NavLink>
  );
}

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside aria-label="Main Navigation" className={`${mobile ? 'w-full' : 'w-64'} bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen`}>
      {/* Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <h1 className="text-lg font-bold font-display text-white tracking-wide flex items-center gap-2.5">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm" aria-hidden="true">🚀</span>
          <span>Career<span className="text-indigo-400">Coach</span></span>
        </h1>
        {mobile && (
          <button onClick={onClose} aria-label="Close Sidebar" className="text-slate-400 hover:text-white transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Sidebar Menu">
        <p className="px-4 pt-2 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest" id="main-menu-heading">Main Menu</p>
        <div aria-labelledby="main-menu-heading">
          {mainMenuItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="pt-4" aria-labelledby="admin-menu-heading">
            <p className="px-4 pt-2 pb-2 text-[11px] font-semibold text-indigo-400 uppercase tracking-widest" id="admin-menu-heading">Admin</p>
            <SidebarLink item={{ name: 'Dashboard', path: '/admin/dashboard', icon: (
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}} />
            <SidebarLink item={{ name: 'Manage Users', path: '/admin/users', icon: (
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}} />
          </div>
        )}

        <div className="pt-4" aria-labelledby="account-menu-heading">
          <p className="px-4 pt-2 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest" id="account-menu-heading">Account</p>
          {bottomMenuItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </div>
      </nav>

      {/* User Card + Logout */}
      <div className="p-3 border-t border-slate-800/80">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white font-display uppercase flex-shrink-0" aria-hidden="true">
              {user.username?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
