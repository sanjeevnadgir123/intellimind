import React, { useState, useEffect } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { LandingView } from './components/LandingView';
import { ChatView } from './components/ChatView';
import { useChat } from './context/ChatContext';
import { useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Loader2 } from 'lucide-react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const { activeChatId, activeSession, sendMessage, setActiveChatId } = useChat();
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'chat'>('landing');

  // Reactively toggle views based on conversation state
  useEffect(() => {
    if (activeChatId && activeSession && activeSession.messages.length > 0) {
      setView('chat');
    } else {
      setView('landing');
    }
  }, [activeChatId, activeSession]);

  const handlePromptSubmit = async (prompt: string) => {
    setView('chat');
    await sendMessage(prompt);
  };

  const handleBackToHome = () => {
    setActiveChatId(null);
    setView('landing');
  };

  if (loading) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#020203] text-white flex items-center justify-center">
        <ParticleCanvas />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-gray-400 font-semibold animate-pulse">Initializing workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020203] text-white">
      {/* Neural Networks Particles Backdrop */}
      <ParticleCanvas />

      {/* Main Content Layout */}
      <main className="relative w-full h-full z-10 flex flex-col">
        {!isAuthenticated ? (
          <AuthView onSuccess={() => setView('landing')} />
        ) : view === 'landing' ? (
          <>
            <Header />
            <LandingView onSubmitPrompt={handlePromptSubmit} />
            <Footer />
          </>
        ) : (
          <ChatView onBackToHome={handleBackToHome} />
        )}
      </main>
    </div>
  );
};

export default App;
