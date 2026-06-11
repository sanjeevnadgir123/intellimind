import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Message, ChatSession, AIModel } from '../types/chat';
import { useAuth } from './AuthContext';

export const AVAILABLE_MODELS: AIModel[] = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq / Meta', description: 'Fast, high-quality reasoning and general task execution.', badge: 'Groq Default' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'Groq / Meta', description: 'Super fast, lightweight model for simpler tasks.', badge: 'Fast' },
];

interface ChatContextType {
  chats: ChatSession[];
  activeChatId: string | null;
  activeModel: string;
  isMemoryEnabled: boolean;
  isRagEnabled: boolean;
  isReasoningEnabled: boolean;
  isGenerating: boolean;
  isSettingsOpen: boolean;
  activeSession: ChatSession | null;
  setActiveChatId: (id: string | null) => void;
  setActiveModel: (model: string) => void;
  setMemoryEnabled: (enabled: boolean) => void;
  setRagEnabled: (enabled: boolean) => void;
  setReasoningEnabled: (enabled: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  createNewChat: () => void;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  clearHistory: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const { token, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return localStorage.getItem('activeChatId') || null;
  });
  const [activeModel, setActiveModel] = useState<string>(() => {
    const saved = localStorage.getItem('activeModel');
    const isValid = AVAILABLE_MODELS.some(m => m.id === saved);
    return isValid && saved ? saved : AVAILABLE_MODELS[0].id;
  });
  const [isMemoryEnabled, setMemoryEnabled] = useState(true);
  const [isRagEnabled, setRagEnabled] = useState(true);
  const [isReasoningEnabled, setReasoningEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Fetch all chats from database when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setChats([]);
      setActiveChatId(null);
      return;
    }

    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const dbChats = await res.json();
          const sessions: ChatSession[] = dbChats.map((c: any) => ({
            id: c.id,
            title: c.title,
            activeModel: c.active_model,
            isMemoryEnabled: c.is_memory_enabled,
            isRagEnabled: c.is_rag_enabled,
            createdAt: c.created_at,
            messages: [] // loaded dynamically below
          }));
          setChats(sessions);
        }
      } catch (err) {
        console.error("Failed to fetch conversations from backend", err);
      }
    };

    fetchChats();
  }, [token, isAuthenticated]);

  // Load messages dynamically when activeChatId changes
  useEffect(() => {
    if (!token || !activeChatId || !isAuthenticated) return;

    const fetchMessages = async () => {
      // Find if we already have messages loaded for this session
      const currentSession = chats.find(c => c.id === activeChatId);
      if (currentSession && currentSession.messages.length > 0) {
        return; // Already loaded
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/conversations/${activeChatId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const dbMsgs = await res.json();
          const messages: Message[] = dbMsgs.map((m: any) => {
            const date = new Date(m.created_at);
            return {
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reasoningSteps: m.reasoning_steps || undefined,
              ragReferences: m.rag_references || undefined
            };
          });

          setChats(prev => prev.map(c => {
            if (c.id === activeChatId) {
              return { ...c, messages };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error("Failed to load messages for conversation", err);
      }
    };

    fetchMessages();
  }, [activeChatId, token, chats.length, isAuthenticated]);

  // Sync basic configurations to localStorage
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId);
    } else {
      localStorage.removeItem('activeChatId');
    }
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem('activeModel', activeModel);
  }, [activeModel]);

  const activeSession = chats.find(c => c.id === activeChatId) || null;

  const createNewChat = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'New Chat',
          active_model: activeModel,
          is_memory_enabled: isMemoryEnabled,
          is_rag_enabled: isRagEnabled
        })
      });

      if (res.ok) {
        const c = await res.json();
        const newSession: ChatSession = {
          id: c.id,
          title: c.title,
          activeModel: c.active_model,
          isMemoryEnabled: c.is_memory_enabled,
          isRagEnabled: c.is_rag_enabled,
          createdAt: c.created_at,
          messages: []
        };
        setChats(prev => [newSession, ...prev]);
        setActiveChatId(newSession.id);
      }
    } catch (err) {
      console.error("Failed to create new chat session", err);
    }
  };

  const deleteChat = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== id));
        if (activeChatId === id) {
          const remaining = chats.filter(c => c.id !== id);
          setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat session", err);
    }
  };

  const updateChatTitle = async (id: string, title: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        setChats(prev => prev.map(c => c.id === id ? { ...c, title } : c));
      }
    } catch (err) {
      console.error("Failed to update chat title", err);
    }
  };

  const clearHistory = async () => {
    if (!token) return;
    try {
      await Promise.all(chats.map(c => 
        fetch(`${API_BASE_URL}/api/conversations/${c.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setChats([]);
      setActiveChatId(null);
    } catch (err) {
      console.error("Failed to clear chat history", err);
    }
  };

  const sendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    if (!token) return;

    let currentSessionId = activeChatId;

    // Create session on the fly if it doesn't exist
    if (!currentSessionId) {
      try {
        const titleText = content.slice(0, 30) + (content.length > 30 ? '...' : '');
        const res = await fetch(`${API_BASE_URL}/api/chat/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: titleText || 'New Chat',
            active_model: activeModel,
            is_memory_enabled: isMemoryEnabled,
            is_rag_enabled: isRagEnabled
          })
        });

        if (res.ok) {
          const c = await res.json();
          const newSession: ChatSession = {
            id: c.id,
            title: c.title,
            activeModel: c.active_model,
            isMemoryEnabled: c.is_memory_enabled,
            isRagEnabled: c.is_rag_enabled,
            createdAt: c.created_at,
            messages: []
          };
          setChats(prev => [newSession, ...prev]);
          setActiveChatId(c.id);
          currentSessionId = c.id;
        } else {
          throw new Error("Could not initialize conversation on database.");
        }
      } catch (err: any) {
        console.error("Failed to auto-create conversation", err);
        return;
      }
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ragReferences: isRagEnabled && files && files.length > 0 ? files.map(f => f.name) : undefined
    };

    // Update locally with User Message
    setChats(prev => prev.map(c => {
      if (c.id === currentSessionId) {
        const title = c.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : c.title;
        return {
          ...c,
          title,
          messages: [...c.messages, userMsg]
        };
      }
      return c;
    }));

    setIsGenerating(true);

    try {
      const payload = {
        conversation_id: currentSessionId,
        content: content,
        model: activeModel,
        temperature: 0.3,
        rag_references: userMsg.ragReferences
      };

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }

      const data = await res.json();
      const answer = data.content;

      const steps = data.assistant_message?.reasoning_steps || undefined;
      const refs = data.assistant_message?.rag_references || undefined;

      const assistantMsg: Message = {
        id: data.assistant_message?.id || crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningSteps: steps,
        ragReferences: refs
      };

      setChats(prev => prev.map(c => {
        if (c.id === currentSessionId) {
          // Sync exact title if updated on database
          return {
            ...c,
            messages: [...c.messages, assistantMsg]
          };
        }
        return c;
      }));

    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ **Connection Error:** Could not retrieve AI response. Make sure the FastAPI server is running.\n\n*Error details: ${err.message || err}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => {
        if (c.id === currentSessionId) {
          return {
            ...c,
            messages: [...c.messages, errorMsg]
          };
        }
        return c;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateMessage = async (messageId: string) => {
    if (!activeSession || isGenerating) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    let lastUserPrompt = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (activeSession.messages[i].role === 'user') {
        lastUserPrompt = activeSession.messages[i].content;
        break;
      }
    }

    if (!lastUserPrompt) return;

    // Remove locally
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.slice(0, msgIndex)
        };
      }
      return c;
    }));

    await sendMessage(lastUserPrompt);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeModel,
        isMemoryEnabled,
        isRagEnabled,
        isReasoningEnabled,
        isGenerating,
        isSettingsOpen,
        activeSession,
        setActiveChatId,
        setActiveModel,
        setMemoryEnabled,
        setRagEnabled,
        setReasoningEnabled,
        setSettingsOpen,
        createNewChat,
        deleteChat,
        updateChatTitle,
        sendMessage,
        clearHistory,
        regenerateMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
