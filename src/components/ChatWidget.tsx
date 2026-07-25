"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const SUGGESTED = [
  "What events are coming up?",
  "How do I book a ticket?",
  "Are there any Tech events?",
  "What payment methods do you accept?",
  "Can I cancel my booking?",
  "What's the cheapest event?",
];

const STORAGE_KEY = "aurum_chat_sessions";

function loadSessions(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = loadSessions();
    setSessions(stored);
    if (stored.length > 0) {
      const latest = stored[0];
      setActiveId(latest.id);
      setMessages(latest.messages);
    }
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function persist(m: Message[], id: string) {
    const updated = sessions.map((s) =>
      s.id === id
        ? { ...s, messages: m, updatedAt: Date.now(), title: m.find((msg) => msg.role === "user")?.content?.slice(0, 50) || s.title }
        : s
    );
    const sorted = updated.sort((a, b) => b.updatedAt - a.updatedAt);
    setSessions(sorted);
    saveSessions(sorted);
  }

  function newChat() {
    const id = Date.now().toString();
    const session: Session = {
      id,
      title: "New chat",
      messages: [{ role: "assistant", content: "Hi! I'm Aurum AI. Ask me about our events!" }],
      updatedAt: Date.now(),
    };
    const updated = [session, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    setActiveId(id);
    setMessages(session.messages);
    setShowHistory(false);
  }

  function switchChat(id: string) {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setActiveId(id);
      setMessages(session.messages);
      setShowHistory(false);
    }
  }

  function deleteChat(id: string) {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        const next = updated[0];
        setActiveId(next.id);
        setMessages(next.messages);
      } else {
        newChat();
      }
    }
  }

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });
      const data = await res.json();
      const final = [...newMessages, { role: "assistant" as const, content: data.reply || "Sorry, something went wrong." }];
      setMessages(final);
      if (activeId) persist(final, activeId);
    } catch {
      const final = [...newMessages, { role: "assistant" as const, content: "Sorry, I'm having trouble connecting. Try again." }];
      setMessages(final);
      if (activeId) persist(final, activeId);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
        {!open && (
          <span className="hidden sm:block bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface text-[13px] leading-[18px] px-4 py-2 rounded-full shadow-lg border border-outline-variant/10 animate-fade-in">
            Ask Aurum AI
          </span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group ring-2 ring-primary/20 ring-offset-2 ring-offset-surface"
          aria-label="Chat"
        >
          <span className={`material-symbols-outlined text-[28px] transition-transform duration-300 ${open ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}>smart_toy</span>
          <span className={`material-symbols-outlined text-[28px] absolute transition-transform duration-300 ${open ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`}>close</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface-container-lowest animate-pulse" />
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 left-6 w-[340px] sm:w-[380px] max-w-[calc(100vw-32px)] h-[500px] md:h-[560px] max-h-[calc(100vh-200px)] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-outline-variant/10 animate-slide-up">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary via-primary-fixed to-primary-container text-on-primary px-5 py-4 flex items-center justify-between flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
              <div>
                <p className="text-[14px] leading-[20px] font-semibold tracking-tight">Aurum AI</p>
                <p className="text-[11px] leading-[16px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                  showHistory ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
              </button>
              <button
                onClick={newChat}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
          </div>

          {/* Messages / History */}
          {showHistory ? (
            <div className="flex-1 flex flex-col bg-surface-container">
              <div className="px-5 py-3 flex items-center justify-between border-b border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">history</span>
                  <span className="text-[13px] leading-[18px] font-semibold text-on-surface">Chat History</span>
                </div>
                <button
                  onClick={newChat}
                  className="text-[12px] leading-[16px] font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span> New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px] text-outline">chat</span>
                    </div>
                    <p className="text-[13px] leading-[18px] font-medium text-on-surface mb-1">No chats yet</p>
                    <button onClick={newChat} className="text-[12px] leading-[16px] text-primary font-medium cursor-pointer">Start a new chat</button>
                  </div>
                ) : (
                  sessions.map((s) => {
                    const lastMsg = s.messages[s.messages.length - 1]?.content || "";
                    return (
                      <div
                        key={s.id}
                        onClick={() => switchChat(s.id)}
                        className={`group px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                          activeId === s.id
                            ? "bg-surface-container-lowest border-primary/20 shadow-sm"
                            : "bg-surface-container-lowest/60 border-transparent hover:border-outline-variant/20 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <p className="text-[13px] leading-[18px] font-medium text-on-surface truncate">{s.title}</p>
                            </div>
                            <p className="text-[11px] leading-[15px] text-outline line-clamp-2 mb-1.5">{lastMsg}</p>
                            <div className="flex items-center gap-3 text-[10px] leading-[14px] text-outline-variant">
                              <span>{formatTime(s.updatedAt)}</span>
                              <span>·</span>
                              <span>{s.messages.length} message{s.messages.length !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteChat(s.id); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-outline-variant opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all duration-150 cursor-pointer flex-shrink-0 mt-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--surface-container)_0%,_transparent_60%)]">
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[32px] text-primary">smart_toy</span>
                    </div>
                    <p className="text-[14px] leading-[20px] font-medium text-on-surface mb-1">Hello! How can I help you?</p>
                    <p className="text-[12px] leading-[16px] text-outline mb-4">Try one of these questions:</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {SUGGESTED.slice(0, 4).map((q) => (
                        <button
                          key={q}
                          onClick={() => { setInput(q); setTimeout(() => send(), 100); }}
                          className="text-[11px] leading-[15px] px-3 py-1.5 rounded-full bg-primary-container/20 text-primary hover:bg-primary-container/40 transition-all duration-150 cursor-pointer border border-primary/10"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center flex-shrink-0 mb-1">
                    <span className="material-symbols-outlined text-[14px] text-on-primary">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-[18px] ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary-fixed text-on-primary rounded-2xl rounded-br-md shadow-md"
                      : "bg-surface-container text-on-surface rounded-2xl rounded-bl-md shadow-sm border border-outline-variant/5"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:bg-surface-container-high prose-code:px-1 prose-code:rounded prose-code:text-[12px] prose-strong:text-on-surface prose-headings:text-on-surface">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 mb-1">
                    <span className="material-symbols-outlined text-[14px] text-on-surface">person</span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center flex-shrink-0 mb-1">
                  <span className="material-symbols-outlined text-[14px] text-on-primary">smart_toy</span>
                </div>
                <div className="bg-surface-container text-on-surface px-5 py-3 rounded-2xl rounded-bl-md shadow-sm border border-outline-variant/5">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 pt-2 pb-0 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-[11px] leading-[15px] px-2.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant hover:bg-primary-container/40 hover:text-primary transition-all duration-150 cursor-pointer border border-outline-variant/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-outline-variant/10 bg-surface-container-lowest flex-shrink-0">
            <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-200">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type your message..."
                className="flex-1 py-2 bg-transparent text-[13px] leading-[18px] outline-none text-on-surface placeholder:text-outline/60"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-primary text-on-primary rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all duration-150 cursor-pointer flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    )}
    </>
  );
}

