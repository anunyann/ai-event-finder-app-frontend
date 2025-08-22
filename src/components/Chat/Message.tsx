import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { formatEventDateTime } from '@/lib/format';
import { Event } from '@/types';
import { Calendar, MapPin, User, Clock, Sparkles, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MessageProps {
  type: 'user' | 'ai';
  content: string;          // may be a JSON string from the AI
  events?: Event[];
  timestamp: Date;
  onEventClick?: (event: Event) => void;
}

function extractAIText(raw: string): string {
  if (!raw) return '';
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && typeof (obj as any).response === 'string') {
      return (obj as any).response;
    }
    return JSON.stringify(obj, null, 2);
  } catch {
    return raw; // already plain text
  }
}

/** Renders AI text as pretty Markdown with a subtle gradient frame + copy button */
function RichAIContent({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="relative group">
      {/* gradient frame */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-purple-400/10 to-transparent blur-[2px]" />
      <div className="relative rounded-2xl bg-background/70 backdrop-blur-sm border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">AI</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleCopy}
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Copy"
              title="Copy"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Markdown body */}
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-li:my-0 prose-ul:my-2 prose-ol:my-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            // Optional: customize elements for nicer bullets, etc.
            components={{
              li({ children, ...props }) {
                return (
                  <li {...props} className="list-disc marker:text-muted-foreground">
                    {children}
                  </li>
                );
              },
              h1({ children }) {
                return <h3 className="text-lg font-semibold">{children}</h3>;
              },
              h2({ children }) {
                return <h4 className="text-base font-semibold">{children}</h4>;
              },
              code({ children }) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {children}
                  </code>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function Message({ type, content, events, timestamp, onEventClick }: MessageProps) {
  const isUser = type === 'user';
  const display = isUser ? content : extractAIText(content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        {isUser ? (
          <div className="chat-bubble-user mb-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{display}</p>
          </div>
        ) : (
          <div className="mb-2">
            <RichAIContent text={display} />
          </div>
        )}

        {/* Events Results (unchanged) */}
        {events && events.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Found {events.length} event{events.length !== 1 ? 's' : ''}
            </h4>

            <div className="grid gap-3">
              {events.map((event, index) => (
                <EventCard
                  key={`${event.title}-${index}`}
                  event={event}
                  onClick={() => onEventClick?.(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs text-muted-foreground mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      className="glass-card-hover p-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {event.title}
          </h5>

          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatEventDateTime(event.datetime)}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>

          {event.organizer && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span>{event.organizer.name} {event.organizer.surname}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
