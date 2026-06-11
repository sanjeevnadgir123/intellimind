import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Send, 
  Paperclip, 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown, 
  Brain, 
  Bot, 
  User, 
  FileText, 
  X, 
  ArrowLeft,
  RefreshCw,
  Cpu,
  Sparkles,
  Zap,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Trash2,
  Edit2,
  MessageSquare
} from 'lucide-react';
import { useChat, AVAILABLE_MODELS } from '../context/ChatContext';
import { useSidebar } from '../context/SidebarContext';

interface ChatViewProps {
  onBackToHome: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ onBackToHome }) => {
  const { 
    chats,
    activeChatId,
    setActiveChatId,
    activeSession, 
    sendMessage, 
    isGenerating, 
    isMemoryEnabled, 
    isRagEnabled, 
    activeModel,
    regenerateMessage,
    createNewChat,
    deleteChat,
    updateChatTitle
  } = useChat();

  const { isCollapsed, toggleSidebar } = useSidebar();

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMsgs, setLikedMsgs] = useState<Record<string, 'like' | 'dislike'>>({});
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  
  // Renaming chat states
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === activeModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isGenerating]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveRename = (chatId: string) => {
    if (editTitleValue.trim()) {
      updateChatTitle(chatId, editTitleValue.trim());
    }
    setEditingChatId(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const pdfs = files.filter(f => f.type === 'application/pdf');
    if (pdfs.length === 0) {
      alert("Only PDF files are supported in current RAG pipeline!");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAttachedFiles(prevFiles => [...prevFiles, ...pdfs]);
          setIsUploading(false);
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    const currentInput = input;
    const currentFiles = attachedFiles;
    setInput('');
    setAttachedFiles([]);
    await sendMessage(currentInput, currentFiles);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setLikedMsgs(prev => ({
      ...prev,
      [id]: prev[id] === type ? '' as any : type
    }));
  };

  const getModelIcon = (id: string) => {
    if (id.includes('deepseek')) return <Brain className="w-4 h-4 text-purple-400" />;
    if (id.includes('llama')) return <Sparkles className="w-4 h-4 text-indigo-400" />;
    if (id.includes('mixtral')) return <Zap className="w-4 h-4 text-amber-400" />;
    return <Cpu className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="flex-1 flex h-screen w-full relative overflow-hidden select-text bg-[#020203] text-white">
      {/* Collapsible Sidebar */}
      <div 
        className={`h-screen border-r border-white/5 bg-[#07070a]/95 backdrop-blur-xl flex flex-col transition-all duration-300 z-40 select-none shrink-0 ${
          isCollapsed ? 'w-0 border-r-0 overflow-hidden' : 'w-72'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-white tracking-wide font-display">Chat History</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-all"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button Row */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/30 bg-white/[0.01] hover:bg-indigo-500/5 text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            New Chat
          </button>
        </div>

        {/* Chat List Scrollable View */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 scrollbar-thin">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
              <span className="text-xs text-gray-500 font-medium leading-relaxed">No chat sessions found.<br/>Click 'New Chat' to start.</span>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = activeChatId === chat.id;
              const isEditing = editingChatId === chat.id;
              return (
                <div 
                  key={chat.id}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer transition-all duration-200 border ${
                    isActive 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-white font-semibold shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      onBlur={() => handleSaveRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                      className="bg-black/40 border border-white/10 text-white text-xs font-semibold rounded px-1.5 py-0.5 outline-none focus:border-indigo-500/50 w-full"
                      autoFocus
                    />
                  ) : (
                    <div 
                      onClick={() => setActiveChatId(chat.id)}
                      className="flex items-center gap-2.5 truncate flex-1 min-w-0"
                    >
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                      <span className="truncate text-xs tracking-wide">{chat.title}</span>
                    </div>
                  )}

                  {/* Actions buttons */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(chat.id);
                          setEditTitleValue(chat.title);
                        }}
                        className="p-1 text-gray-500 hover:text-indigo-400 rounded hover:bg-white/5"
                        title="Rename Chat"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this conversation?")) {
                            deleteChat(chat.id);
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-white/5"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div 
        className="flex-1 flex flex-col h-screen relative overflow-hidden select-text bg-[#020203]"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Dynamic Top Bar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#09090c]/40 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button when collapsed */}
            {isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all border border-white/5"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all text-xs font-semibold uppercase tracking-wider border border-white/5 shadow-sm"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
            
            <div className="h-4 w-[1px] bg-white/10" />

            {/* Active Model Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
              {getModelIcon(currentModel.id)}
              <span className="hidden sm:inline">{currentModel.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Dots */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Backend
            </span>
            {isMemoryEnabled && (
              <span className="hidden md:flex items-center gap-1 text-[10px] text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 font-medium">
                Memory Active
              </span>
            )}
            {isRagEnabled && (
              <span className="hidden md:flex items-center gap-1 text-[10px] text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 font-medium">
                RAG Active
              </span>
            )}
          </div>
        </div>

        {/* Drag PDF overlay */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-500/10 border-2 border-dashed border-indigo-500/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-50 pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center shadow-lg border border-indigo-500/30 animate-bounce">
                <FileText className="w-8 h-8 text-indigo-400" />
              </div>
              <span className="text-white font-semibold text-lg animate-pulse">Drop PDF Context Document</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat scroll area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {activeSession?.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const hasReasoning = msg.reasoningSteps && msg.reasoningSteps.length > 0;
              const hasReferences = msg.ragReferences && msg.ragReferences.length > 0;

              return (
                <div key={msg.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Bubble Header */}
                    <div className="flex items-center gap-2 mb-1.5 px-1 text-[10px] text-gray-500 font-medium">
                      <span>{isUser ? 'You' : 'IntelliMind'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Msg Bubble body */}
                    <div className={`rounded-2xl p-4 border shadow-sm ${
                      isUser 
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-white' 
                        : 'bg-white/[0.02] border-white/5 text-gray-200'
                    }`}>
                      {/* Thought process expander */}
                      {hasReasoning && (
                        <div className="mb-3 border-l-2 border-purple-500/30 pl-3 select-none">
                          <button
                            onClick={() => toggleReasoning(msg.id)}
                            className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold hover:text-purple-300 transition-all"
                          >
                            <Brain className="w-3.5 h-3.5 animate-pulse" />
                            {expandedReasoning[msg.id] ? 'Hide thinking steps' : 'Show thinking steps'}
                          </button>
                          {expandedReasoning[msg.id] && (
                            <div className="mt-2 space-y-1">
                              {msg.reasoningSteps?.map((step, sIdx) => (
                                <div key={sIdx} className="text-[11px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
                                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* PDF attachments reference list */}
                      {hasReferences && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {msg.ragReferences?.map((ref, rIdx) => (
                            <span key={rIdx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-medium">
                              <FileText className="w-2.5 h-2.5" />
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Markdown Renderer */}
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed font-medium break-words">
                        <ReactMarkdown
                          components={{
                            code({ inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <div className="relative rounded-lg overflow-hidden border border-white/5 my-2.5 select-text">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 text-[11px] text-gray-400 border-b border-white/5 font-semibold">
                                    <span>{match[1].toUpperCase()}</span>
                                    <button
                                      onClick={() => handleCopyText(msg.id + '-code', String(children))}
                                      className="flex items-center gap-1 hover:text-white transition-all"
                                    >
                                      {copiedId === msg.id + '-code' ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, background: '#09090c', padding: '12px' }}
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-indigo-300 font-semibold" {...props}>
                                    {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    {!isUser && (
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => regenerateMessage(msg.id)}
                          className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                          title="Regenerate"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'like')}
                          className={`p-1 rounded hover:bg-white/5 transition-all ${
                            likedMsgs[msg.id] === 'like' ? 'text-indigo-400' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'dislike')}
                          className={`p-1 rounded hover:bg-white/5 transition-all ${
                            likedMsgs[msg.id] === 'dislike' ? 'text-red-400' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loader Skeleton */}
            {isGenerating && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col max-w-[85%] items-start w-full">
                  <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-gray-500 font-medium">
                    <span>Thinking...</span>
                  </div>
                  <div className="rounded-2xl p-4 border border-white/5 bg-white/[0.01] w-full space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Chat Input bar */}
        <div className="p-4 bg-transparent border-t border-white/5">
          <div className="max-w-3xl mx-auto relative">
            
            {/* File Pills Preview */}
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((file, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-1.5 px-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-xs text-purple-300"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="rounded hover:bg-white/10 p-0.5"
                  >
                    <X className="w-3 h-3 text-purple-400" />
                  </button>
                </div>
              ))}
              
              {isUploading && (
                <div className="w-full flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-white/[0.02]">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold mb-1">
                      <span>Parsing Document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="bg-indigo-500 h-1 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="relative border border-white/5 rounded-2xl bg-[#09090c]/80 shadow-2xl glass-input overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRagEnabled ? "Type query or attach PDF context..." : "Ask IntelliMind..."}
                disabled={isGenerating || isUploading}
                rows={2}
                className="w-full bg-transparent border-0 outline-none text-white text-sm p-3.5 pb-10 resize-none font-medium leading-relaxed"
              />
              
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Upload PDF context"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                <div className="pointer-events-auto">
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && attachedFiles.length === 0) || isGenerating || isUploading}
                    className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md disabled:from-white/5 disabled:to-transparent disabled:text-gray-600 disabled:shadow-none hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-95 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
