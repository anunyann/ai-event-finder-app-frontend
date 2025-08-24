import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Send, History } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Textarea } from '../UI/textarea.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/UI/dropdown-menu';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  recentPrompts: string[];
  propagatedMessage: string | '';
}

export function Composer({ onSendMessage, isLoading, recentPrompts, propagatedMessage }: ComposerProps) {
  const [message, setMessage] = useState(propagatedMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
        setMessage(propagatedMessage ?? '');
        if (propagatedMessage) textareaRef.current?.focus();
    }, [propagatedMessage]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRecentPromptSelect = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };


    return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-4">
          <div className="flex items-end space-x-3">
            {/* Recent Prompts Dropdown */}
            {recentPrompts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 flex-shrink-0"
                    disabled={isLoading}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 glass-card">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Recent Prompts
                    </div>
                    {recentPrompts.slice(0, 5).map((prompt, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleRecentPromptSelect(prompt)}
                        className="cursor-pointer text-sm"
                      >
                        <div className="truncate max-w-full">
                          {prompt}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Message Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about events... (Enter to send, Shift+Enter for new line)"
                className="min-h-[44px] max-h-32 resize-none pr-12 focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              className="h-11 px-6 gradient-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Try asking: "Find tech events in San Francisco" or "Show me workshops next week"
          </div>
        </div>
      </div>
    </div>
  );
}