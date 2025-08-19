import { Event } from '@/types';
import { formatEventDateTime } from '@/lib/format';
import { Calendar, MapPin, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
  onViewDetails?: () => void;
  onManageParticipants?: () => void;
}

export function EventCard({ event, onViewDetails, onManageParticipants }: EventCardProps) {
  return (
    <div className="glass-card-hover p-6 group">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {event.title}
            </h3>
            <Badge variant="secondary" className="mt-2 w-fit">
              {event.category}
            </Badge>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4 flex-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
            <span>{formatEventDateTime(event.datetime)}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          {event.organizer && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-3 flex-shrink-0" />
              <span>{event.organizer.name} {event.organizer.surname}</span>
            </div>
          )}
          
          {event.guests && event.guests.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-3 flex-shrink-0" />
              <span>{event.guests.length} participant{event.guests.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {event.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="hover:bg-muted/50"
          >
            View Details
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onManageParticipants}
            className="hover:bg-muted/50"
          >
            <Users className="h-4 w-4 mr-2" />
            Participants
          </Button>
        </div>
      </div>
    </div>
  );
}