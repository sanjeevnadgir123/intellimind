import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 h-16 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 z-30 select-none text-xs text-gray-500 gap-3 md:gap-0 pb-4 md:pb-0">
      {/* Copyright */}
      <div className="order-2 md:order-1 font-medium">
        © 2026 IntelliMind. All rights reserved.
      </div>

      {/* Center Security Badge */}
      <div className="order-1 md:order-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.01] backdrop-blur-md shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-semibold text-gray-400">Privacy First</span>
        <span className="text-gray-600">•</span>
        <span className="font-semibold text-gray-400">Secure</span>
        <span className="text-gray-600">•</span>
        <span className="font-semibold text-gray-400">Fast</span>
      </div>

      {/* Credit */}
      <div className="order-3 flex items-center gap-1 font-medium">
        <span>Made with</span>
        <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
        <span>for the future</span>
      </div>
    </footer>
  );
};
