export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  reasoningSteps?: string[]; // For showing Agent / LLM reasoning process
  ragReferences?: string[]; // Documents or search results referenced
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  activeModel: string;
  isMemoryEnabled: boolean;
  isRagEnabled: boolean;
  createdAt: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
  isPremium?: boolean;
}
