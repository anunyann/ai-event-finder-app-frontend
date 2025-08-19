import { formatEventDateTime } from '@/lib/format';
import { Event } from '@/types';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MessageProps {
  type: 'user' | 'ai';
  content: string;
  events?: Event[];
  timestamp: Date;
  onEventClick?: (event: Event) => void;
}

export function Message({ type, content, events, timestamp, onEventClick }: MessageProps) {
  const isUser = type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div className={`${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} mb-2`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Events Results */}
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