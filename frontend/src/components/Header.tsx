import React from 'react';
import { Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-30 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 blur-md opacity-50" />
          <div className="relative w-9 h-9 rounded-xl bg-[#09090c] border border-white/10 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <span className="font-semibold text-white tracking-wide text-lg font-display">IntelliMind</span>
      </div>

      {/* Auth State Button */}
      {isAuthenticated && user ? (
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
            Hello, <span className="text-indigo-400">{user.name}</span>
          </span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold tracking-wider uppercase active:scale-95 transition-all shadow-md backdrop-blur-md border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold tracking-wider uppercase active:scale-95 transition-all shadow-md backdrop-blur-md">
          <User className="w-4 h-4 text-indigo-400" />
          Sign In
        </button>
      )}
    </header>
  );
};
