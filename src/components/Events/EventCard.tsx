import { Event } from '@/types';
import { formatEventDateTime } from '@/lib/format';
import { Calendar, MapPin, User, Users, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {useAuth} from "@/hooks/useAuth.ts";
import { Badge  } from "../UI/badge.tsx";

interface EventCardProps {
  event: Event;
  onManageParticipants?: () => void;
  onUserClick?: (email: string) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

export function EventCard({ event, onManageParticipants, onUserClick, onEdit, onDelete }: EventCardProps) {
  const organizerEmail = event.organizer?.email ?? '';
  const { user: authUser }= useAuth()
      const isSelf = organizerEmail === authUser.email;
  return (
    <div className="glass-card-hover p-6 group h-full flex flex-col">
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

      {/* Body */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-3 mb-4">
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
              <span
                className="cursor-pointer hover:underline"
                onClick={() => organizerEmail && onUserClick?.(organizerEmail)}
              >
                {event.organizer.name} {event.organizer.surname}
              </span>
            </div>
          )}

          {event.guests && event.guests.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-3 flex-shrink-0" />
              <span>
                {event.guests.length} participant{event.guests.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
            {event.description || '\u00A0'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onManageParticipants}
          className="hover:bg-muted/50"
        >
          <Users className="h-4 w-4 mr-2" />
          Participants
        </Button>
          {isSelf && (<div className="flex items-center gap-2">
              <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => onEdit?.(event)}
                  aria-label="Edit event"
                  title="Edit"
              >
                  <Pencil className="h-4 w-4" />
              </Button>
              <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete?.(event)}
                  aria-label="Delete event"
                  title="Delete"
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
          </div>)}

      </div>
    </div>
  );
}
