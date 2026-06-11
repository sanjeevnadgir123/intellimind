import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Paperclip, 
  Globe, 
  Mic, 
  ArrowRight, 
  GraduationCap, 
  Code, 
  Rocket, 
  FileText, 
  Layers, 
  Atom, 
  Brain, 
  MessageSquare
} from 'lucide-react';

interface LandingViewProps {
  onSubmitPrompt: (prompt: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSubmitPrompt }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmitPrompt(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim()) {
        onSubmitPrompt(query.trim());
        setQuery('');
      }
    }
  };

  // 6 Custom themed cards matching the mockup image (icons & colors)
  const prompts = [
    { 
      text: "Explain Machine Learning", 
      icon: <GraduationCap className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />, 
      borderColor: "hover:border-purple-500/30",
      glowColor: "group-hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]"
    },
    { 
      text: "Generate Python Code", 
      icon: <Code className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />, 
      borderColor: "hover:border-blue-500/30",
      glowColor: "group-hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
    },
    { 
      text: "Create a Startup Plan", 
      icon: <Rocket className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />, 
      borderColor: "hover:border-pink-500/30",
      glowColor: "group-hover:shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]"
    },
    { 
      text: "Summarize a PDF", 
      icon: <FileText className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />, 
      borderColor: "hover:border-sky-500/30",
      glowColor: "group-hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]"
    },
    { 
      text: "Explain System Design", 
      icon: <Layers className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />, 
      borderColor: "hover:border-indigo-500/30",
      glowColor: "group-hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]"
    },
    { 
      text: "Build a React App", 
      icon: <Atom className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />, 
      borderColor: "hover:border-teal-500/30",
      glowColor: "group-hover:shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]"
    }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 z-10 overflow-y-auto">
      
      {/* Floating Icons Decorator Panel */}
      <div className="absolute inset-0 pointer-events-none hidden xl:block select-none overflow-hidden">
        {/* Top-Left: Brain Card */}
        <motion.div
          initial={{ y: 0, rotate: -12 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[12%] w-16 h-16 rounded-xl border border-white/5 bg-white/[0.02] shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] backdrop-blur-md flex items-center justify-center rotate-[-12deg]"
        >
          <Brain className="w-7 h-7 text-indigo-400 opacity-60" />
        </motion.div>

        {/* Bottom-Left: Code Card */}
        <motion.div
          initial={{ y: 0, rotate: 15 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[28%] left-[10%] w-16 h-16 rounded-xl border border-white/5 bg-white/[0.02] shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)] backdrop-blur-md flex items-center justify-center rotate-[15deg]"
        >
          <Code className="w-7 h-7 text-purple-400 opacity-60" />
        </motion.div>

        {/* Top-Right: File Card */}
        <motion.div
          initial={{ y: 0, rotate: 10 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[22%] right-[12%] w-16 h-16 rounded-xl border border-white/5 bg-white/[0.02] shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] backdrop-blur-md flex items-center justify-center rotate-[10deg]"
        >
          <FileText className="w-7 h-7 text-indigo-400 opacity-60" />
        </motion.div>

        {/* Bottom-Right: Chat Card */}
        <motion.div
          initial={{ y: 0, rotate: -8 }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[28%] right-[11%] w-16 h-16 rounded-xl border border-white/5 bg-white/[0.02] shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)] backdrop-blur-md flex items-center justify-center rotate-[-8deg]"
        >
          <MessageSquare className="w-7 h-7 text-purple-400 opacity-60" />
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-9 relative">
        
        {/* Powered By Badge */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-[10px] sm:text-xs font-semibold text-gray-400 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>Powered by <span className="text-gray-300">Groq + Llama 3</span></span>
        </motion.div>

        {/* Headings */}
        <div className="space-y-4">
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-display select-none"
          >
            Intelli<span className="text-gradient-purple">Mind</span>
          </motion.h1>
          <motion.h2
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-semibold text-gray-200 font-display"
          >
            Your Intelligent AI Assistant
          </motion.h2>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xs sm:text-sm text-gray-500 tracking-wide font-medium"
          >
            Ask anything. Learn faster. Build smarter.
          </motion.p>
        </div>

        {/* Giant Glowing Search Box */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onSubmit={handleFormSubmit}
          className="w-full max-w-3xl relative px-2 sm:px-0"
        >
          {/* Neon Gradient Border Glow wrapper */}
          <div className={`absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-blue-500/80 via-purple-600/40 to-purple-500/80 blur-[8px] transition-opacity duration-500 ${
            isFocused ? 'opacity-55' : 'opacity-25'
          }`} />

          {/* Search Box Body */}
          <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-r from-blue-500/60 via-purple-600/30 to-purple-500/60 shadow-[0_0_40px_-10px_rgba(139,92,246,0.35)] overflow-hidden">
            <div className="w-full rounded-[23px] bg-[#050508]/95 backdrop-blur-xl flex flex-col p-4 sm:p-5 relative min-h-[140px] select-text">
              
              {/* Input row (sparkle icon + textarea) */}
              <div className="flex gap-3 items-start flex-1">
                <Sparkles className="w-5 h-5 text-indigo-400/75 shrink-0 mt-1" />
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask Anything..."
                  rows={2}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 text-white text-md placeholder-gray-500/70 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Bottom Action bar */}
              <div className="flex items-center justify-between mt-4">
                
                {/* Left Action Pills */}
                <div className="flex items-center gap-2">
                  {/* Attach Button */}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/5 text-xs text-gray-300 font-semibold active:scale-95 transition-all shadow-sm"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                    Attach
                  </button>

                  {/* Web Search Button */}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/5 text-xs text-gray-300 font-semibold active:scale-95 transition-all shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    Web Search
                  </button>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Mic button */}
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Circle Gradient Submit Button */}
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 active:scale-90 disabled:from-white/5 disabled:to-transparent disabled:text-gray-600 disabled:shadow-none transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </motion.form>

        {/* Divider Try Asking About */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full flex items-center justify-center gap-4 text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest select-none pt-4"
        >
          <div className="h-[1px] w-20 bg-white/5" />
          <span>Try asking about</span>
          <div className="h-[1px] w-20 bg-white/5" />
        </motion.div>

        {/* Cards Row grid (6 items) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 w-full select-none">
          {prompts.map((card, i) => (
            <motion.div
              key={i}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              onClick={() => onSubmitPrompt(card.text)}
              className={`group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-white/5 bg-[#07070a]/40 hover:bg-[#09090d]/80 cursor-pointer active:scale-[0.98] transition-all duration-300 hover:border-white/10 ${card.borderColor} ${card.glowColor}`}
            >
              {card.icon}
              <span className="text-[11px] font-semibold text-gray-400 group-hover:text-white leading-relaxed transition-colors tracking-wide max-w-[100px]">
                {card.text}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
