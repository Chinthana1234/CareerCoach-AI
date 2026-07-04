import React, { useState, useEffect, useRef } from 'react';
import { 
  getChatSessions, 
  createChatSession, 
  deleteChatSession, 
  getChatMessages,
  getChatStreamUrl
} from '../../../api/chatService';

// Custom lightweight Markdown text renderer
function parseInlineStyles(str) {
  if (typeof str !== 'string') return str;
  
  // Parse bold style **text**
  let parts = str.split(/\*\*([^*]+)\*\*/g);
  let parsed = parts.map((subText, idx) => {
    return idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-indigo-400">{subText}</strong> : subText;
  });

  // Parse inline code style `code`
  parsed = parsed.flatMap((part, i) => {
    if (typeof part !== 'string') return part;
    const split = part.split(/`([^`]+)`/g);
    return split.map((subText, idx) => {
      return idx % 2 === 1 ? (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-pink-400">
          {subText}
        </code>
      ) : subText;
    });
  });

  return parsed;
}

function MarkdownText({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
      {lines.map((line, lineIdx) => {
        // Headers: ### Title
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const titleContent = headerMatch[2];
          const parsedTitle = parseInlineStyles(titleContent);
          
          if (level === 1) return <h1 key={lineIdx} className="text-xl font-extrabold font-display text-white mt-4 mb-2">{parsedTitle}</h1>;
          if (level === 2) return <h2 key={lineIdx} className="text-lg font-bold font-display text-white mt-4 mb-2">{parsedTitle}</h2>;
          return <h3 key={lineIdx} className="text-sm font-bold font-display text-white mt-3 mb-1.5">{parsedTitle}</h3>;
        }

        // Bullet Lists: - Item
        const ulMatch = line.match(/^[\-\*]\s+(.*)$/);
        if (ulMatch) {
          return (
            <li key={lineIdx} className="list-disc list-inside ml-2.5 text-slate-200">
              {parseInlineStyles(ulMatch[1])}
            </li>
          );
        }

        // Numbered Lists: 1. Item
        const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (olMatch) {
          return (
            <li key={lineIdx} className="list-decimal list-inside ml-2.5 text-slate-200">
              {parseInlineStyles(olMatch[2])}
            </li>
          );
        }

        // Empty lines
        if (line.trim() === '') {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Regular Paragraph
        return <p key={lineIdx} className="text-slate-200">{parseInlineStyles(line)}</p>;
      })}
    </div>
  );
}

// Conversation starters (presets)
const PRESETS = [
  {
    icon: '📝',
    title: 'Optimize Resume',
    description: 'Structure and tailor a CV for Tech roles.',
    prompt: 'Help me optimize my resume summary. How can I use the STAR method to describe project successes?'
  },
  {
    icon: '🎤',
    title: 'Interview Prep',
    description: 'Learn framework and STAR tactics.',
    prompt: 'Can you give me tips to prepare for technical and behavioral interviews? What questions should I ask the recruiter?'
  },
  {
    icon: '🗺️',
    title: 'Career Roadmap',
    description: 'Plan skills for Senior roles.',
    prompt: 'Show me a detailed skill roadmap to grow into a Senior Full Stack Engineer. What technologies should I prioritize?'
  }
];

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

  // Auto scroll to bottom when messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

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

  const handleCreateSession = async (initialPrompt = null) => {
    try {
      const res = await createChatSession();
      const newSession = res.data;
      
      // Select the new session
      setActiveSessionId(newSession.id);
      
      // Update session list
      setSessions(prev => [newSession, ...prev]);

      if (initialPrompt) {
        // Run send directly on new session ID
        sendDirectPrompt(newSession.id, initialPrompt);
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
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

  // Helper to send prompt immediately after session creation
  const sendDirectPrompt = async (sessionId, promptText) => {
    setSending(true);

    const tempUserMsg = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      content: promptText,
      createdAt: new Date().toISOString()
    };
    
    const tempAiMsg = {
      id: 'ai-temp',
      sender: 'AI',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true
    };

    setMessages([tempUserMsg, tempAiMsg]);

    let eventSource = null;
    try {
      const url = getChatStreamUrl(sessionId, promptText);
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const chunk = event.data;
        setMessages(prev => prev.map(msg => 
          msg.id === 'ai-temp' ? { ...msg, content: msg.content + chunk } : msg
        ));
      };

      eventSource.addEventListener('done', () => {
        eventSource.close();
        setSending(false);
        fetchMessages(sessionId);
        fetchSessions(sessionId);
      });

      eventSource.onerror = (err) => {
        console.error("SSE stream error:", err);
        eventSource.close();
        setSending(false);
        fetchMessages(sessionId);
      };

    } catch (err) {
      console.error("Error initializing stream:", err);
      if (eventSource) eventSource.close();
      setSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText;
    setInputText('');
    setSending(true);

    const tempUserMsg = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      content: text,
      createdAt: new Date().toISOString()
    };
    
    const tempAiMsg = {
      id: 'ai-temp',
      sender: 'AI',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true
    };

    setMessages(prev => [...prev, tempUserMsg, tempAiMsg]);

    let eventSource = null;
    try {
      const url = getChatStreamUrl(activeSessionId, text);
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const chunk = event.data;
        setMessages(prev => prev.map(msg => 
          msg.id === 'ai-temp' ? { ...msg, content: msg.content + chunk } : msg
        ));
      };

      eventSource.addEventListener('done', () => {
        eventSource.close();
        setSending(false);
        fetchMessages(activeSessionId);
        fetchSessions(activeSessionId);
      });

      eventSource.onerror = (err) => {
        console.error("SSE stream error:", err);
        eventSource.close();
        setSending(false);
        fetchMessages(activeSessionId);
      };

    } catch (err) {
      console.error("Error initiating stream:", err);
      if (eventSource) eventSource.close();
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
            onClick={() => handleCreateSession()}
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
          {loadingSessions && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Loading history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-slate-500">No chat sessions found.</p>
              <button 
                onClick={() => handleCreateSession()}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Create your first session
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  if (!sending) setActiveSessionId(session.id);
                }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeSessionId === session.id 
                    ? 'bg-indigo-950/40 border border-indigo-500/30 text-white'
                    : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                } ${sending ? 'cursor-not-allowed opacity-80' : ''}`}
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
                  disabled={sending}
                  className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-all duration-200 ml-2 disabled:cursor-not-allowed disabled:opacity-0"
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
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold font-display text-white truncate">{activeSession.title}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-slate-500">Connected to CareerAdvisor-1.0</p>
                </div>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-medium">Loading conversation...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <span className="text-4xl">🤖</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Ask your Career Coach</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Ask a question below about resume building, mock interviews, or career planning to see AI Career Coach insights.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-display ${
                        msg.sender === 'USER' 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                          : 'bg-slate-800 border border-slate-700 text-indigo-400'
                      }`}>
                        {msg.sender === 'USER' ? 'U' : 'AI'}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`rounded-2xl p-4 border ${
                        msg.sender === 'USER' 
                          ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' 
                          : 'bg-slate-800/40 border-slate-800/80 text-slate-100 rounded-tl-none shadow-md shadow-slate-950/20'
                      }`}>
                        {msg.sender === 'USER' ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          // If streaming and text is empty, show loading indicator
                          msg.content === '' && msg.isStreaming ? (
                            <div className="flex gap-1 items-center py-1">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                          ) : (
                            <MarkdownText text={msg.content} />
                          )
                        )}
                        
                        <p className={`text-[9px] mt-2 text-right ${
                          msg.sender === 'USER' ? 'text-indigo-200' : 'text-slate-500'
                        }`}>
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
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
                placeholder={sending ? "AI Coach is typing..." : "Ask a career question..."}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={sending}
              />
              <button 
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Empty Active Session State - Welcome Screen & Presets */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/30 overflow-y-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-600/10 mb-6">
              🚀
            </div>
            <h2 className="text-xl font-extrabold text-white font-display">Your Personal Career Advisor</h2>
            <p className="text-sm text-slate-400 max-w-md mt-2">
              Select an existing consultation from the sidebar, or launch a new conversation with the presets below.
            </p>

            {/* Presets Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-10">
              {PRESETS.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleCreateSession(preset.prompt)}
                  className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/30 active:scale-98 text-left transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl">{preset.icon}</span>
                    <h4 className="text-sm font-bold text-white mt-3 font-display">{preset.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                  </div>
                  <div className="mt-4 flex items-center text-indigo-400 text-xs font-semibold gap-1">
                    Try now
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-slate-500 mt-10">
              Or start with an empty consultation using the button in the top left.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
