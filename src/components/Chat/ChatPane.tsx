import { useEffect, useRef } from 'react';
import { Message } from './Message';
import { Event } from '@/types';
import { ChatMessage } from '@/hooks/useChat';

interface ChatPaneProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onEventClick?: (event: Event) => void;
}

export function ChatPane({ messages, isLoading, onEventClick }: ChatPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Message */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-4">
                Welcome to AI Event Finder
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Ask me anything about events! I can help you find, filter, and discover events that match your interests.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-2">🔍 Search Events</h3>
                  <p className="text-sm text-muted-foreground">
                    "Find tech meetups in New York"
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-2">📅 Filter by Date</h3>
                  <p className="text-sm text-muted-foreground">
                    "Show me events this weekend"
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-2">🏢 Find by Category</h3>
                  <p className="text-sm text-muted-foreground">
                    "Business networking events"
                  </p>
                </div>
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-2">📍 Location-based</h3>
                  <p className="text-sm text-muted-foregreen">
                    "Events near downtown Seattle"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Message
            key={message.id}
            type={message.type}
            content={message.content}
            events={message.events}
            timestamp={message.timestamp}
            onEventClick={onEventClick}
          />
        ))}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex justify-start mb-6 animate-fade-in">
            <div className="max-w-[80%]">
              <div className="chat-bubble-ai">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}