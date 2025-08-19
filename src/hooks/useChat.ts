import { useState } from 'react';
import { apiClient } from '../api';
import { Event } from '../types';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  events?: Event[];
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  const parseAiResponse = (response: any): { content: string; events?: Event[] } => {
    // If response has events array with valid events
    if (response.events && Array.isArray(response.events) && response.events.length > 0) {
      const validEvents = response.events.filter((event: any) => 
        event.title && event.datetime
      );
      
      if (validEvents.length > 0) {
        return {
          content: response.message || `Found ${validEvents.length} event(s)`,
          events: validEvents
        };
      }
    }

    // Fallback to plain text
    if (response.message) {
      return { content: response.message };
    }

    // If it's just raw JSON, stringify it nicely
    return { content: JSON.stringify(response, null, 2) };
  };

  const sendMessage = async (prompt: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add to recent prompts (keep last 10)
    setRecentPrompts(prev => {
      const updated = [prompt, ...prev.filter(p => p !== prompt)];
      return updated.slice(0, 10);
    });

    try {
      const response = await apiClient.queryPrompt(prompt);
      const { content, events } = parseAiResponse(response);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content,
        events,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    recentPrompts,
    sendMessage,
    clearChat,
  };
}
