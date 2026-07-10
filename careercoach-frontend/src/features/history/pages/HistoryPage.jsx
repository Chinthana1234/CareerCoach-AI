import React, { useState } from 'react';
import ChatHistoryTab from '../components/ChatHistoryTab';
import CvHistoryTab from '../components/CvHistoryTab';
import InterviewHistoryTab from '../components/InterviewHistoryTab';
import LinkedinHistoryTab from '../components/LinkedinHistoryTab';
import RoadmapHistoryTab from '../components/RoadmapHistoryTab';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'Chat History', icon: '💬' },
    { id: 'cv', label: 'CV Reviews', icon: '📄' },
    { id: 'interview', label: 'Interview Sessions', icon: '🗣️' },
    { id: 'roadmap', label: 'Career Roadmaps', icon: '🗺️' },
    { id: 'linkedin', label: 'LinkedIn Reviews', icon: '💼' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">Your History</h1>
        <p className="text-slate-400">View and manage all your past interactions, reviews, and sessions.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
        {activeTab === 'chat' && <ChatHistoryTab />}
        {activeTab === 'cv' && <CvHistoryTab />}
        {activeTab === 'interview' && <InterviewHistoryTab />}
        {activeTab === 'roadmap' && <RoadmapHistoryTab />}
        {activeTab === 'linkedin' && <LinkedinHistoryTab />}
      </div>
    </div>
  );
}

