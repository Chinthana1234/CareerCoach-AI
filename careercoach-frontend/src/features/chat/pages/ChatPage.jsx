import React, { useState, useEffect, useRef } from 'react';
import { 
  getChatSessions, 
  createChatSession, 
  deleteChatSession, 
  getChatMessages 
} from '../../../api/chatService';

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Fetch all chat sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const fetchSessions = async (selectNewId = null) => {
    try {
      setLoadingSessions(true);
      const res = await getChatSessions();
      setSessions(res.data);
      if (res.data.length > 0) {
        if (selectNewId) {
          setActiveSessionId(selectNewId);
        } else if (!activeSessionId) {
          // Default to first session
          setActiveSessionId(res.data[0].id);
        }
      } else {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Error fetching chat sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      setLoadingMessages(true);
      const res = await getChatMessages(sessionId);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await createChatSession();
      const newSession = res.data;
      // Refresh session list and select the new session
      await fetchSessions(newSession.id);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); // Avoid selecting the session when deleting it
    if (!window.confirm("Are you sure you want to delete this chat history?")) return;

    try {
      await deleteChatSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
      fetchSessions();
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    // Placeholder for sending message (we will implement SSE in Commit 5)
    // For Commit 4, we will clear the input and simulate adding a message locally
    const text = inputText;
    setInputText('');
    setSending(true);

    try {
      // Temporarily mock user message display
      const tempUserMsg = {
        id: Date.now(),
        sender: 'USER',
        content: text,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // Commit 5 will hook this up to SSE streaming API
      setSending(false);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)] max-w-6xl mx-auto">
      {/* Sidebar Panel - Chat Sessions List */}
      <div className="w-80 hidden md:flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold font-display text-white tracking-wide uppercase">Consultations</h2>
          <button 
            onClick={handleCreateSession}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Loading history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-slate-500">No chat sessions found.</p>
              <button 
                onClick={handleCreateSession}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Create your first session
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeSessionId === session.id 
                    ? 'bg-slate-800 border border-slate-700/80 text-white'
                    : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="flex-shrink-0 text-slate-500 group-hover:text-indigo-400 transition-colors">💬</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-normal">
                      {session.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formatDate(session.updatedAt || session.createdAt)}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-all duration-200 ml-2"
                  title="Delete chat session"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden">
        {activeSession ? (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-bold font-display text-white truncate">{activeSession.title}</h2>
                <p className="text-[10px] text-slate-500">Active session: {activeSession.id}</p>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-medium">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <span className="text-4xl">🤖</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Start the conversation</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Ask a question below about resume building, mock interviews, or career planning to see AI Career Coach insights.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-2xl p-4 max-w-[80%] text-sm ${
                      msg.sender === 'USER' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-800/60 border border-slate-700/40 text-slate-100 rounded-bl-none'
                    }`}>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question..." 
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 transition-colors"
                disabled={sending}
              />
              <button 
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          /* Empty Active Session State - Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/30">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-600/10 mb-6">
              🚀
            </div>
            <h2 className="text-xl font-extrabold text-white font-display">Your Personal Career Advisor</h2>
            <p className="text-sm text-slate-400 max-w-md mt-2">
              Select an existing consultation from the sidebar, or create a new session to begin strategizing your career path.
            </p>
            
            <button 
              onClick={handleCreateSession}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 active:scale-98 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Start New Consultation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
