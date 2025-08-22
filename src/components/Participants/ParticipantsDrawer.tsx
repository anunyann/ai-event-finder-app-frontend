import { useState, useEffect } from 'react';
import { User as UserIcon, Plus, Trash2, Loader2, Users } from 'lucide-react';
import { User } from '@/types';
import { apiClient } from '@/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ParticipantsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
}

export function ParticipantsDrawer({ open, onOpenChange, eventTitle }: ParticipantsDrawerProps) {
  const [participants, setParticipants] = useState<User[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const encodedTitle = encodeURIComponent(eventTitle || '');

  const loadParticipants = async () => {
    if (!eventTitle) return;
    setIsLoading(true);
    try {
      const data = await apiClient.listParticipants(encodedTitle);
      setParticipants(data);
    } catch (error: any) {
      toast({
        title: 'Error loading participants',
        description: error.message || 'Failed to load participants',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && eventTitle) loadParticipants();
  }, [open, eventTitle]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantEmail.trim() || isAdding) return;
    setIsAdding(true);
    try {
      await apiClient.addParticipant(encodedTitle, newParticipantEmail);
      toast({
        title: 'Participant added',
        description: `${newParticipantEmail} has been added to the event`,
        className: 'bg-success text-success-foreground',
      });
      setNewParticipantEmail('');
      await loadParticipants();
    } catch (error: any) {
      toast({
        title: 'Error adding participant',
        description: error.message || 'Failed to add participant',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveParticipant = async (userEmail: string, userName: string) => {
    try {
      await apiClient.removeParticipant(encodedTitle, userEmail);
      toast({
        title: 'Participant removed',
        description: `${userName} has been removed from the event`,
        className: 'bg-success text-success-foreground',
      });
      await loadParticipants();
    } catch (error: any) {
      toast({
        title: 'Error removing participant',
        description: error.message || 'Failed to remove participant',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-card w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center text-gradient">
            <Users className="h-5 w-5 mr-2" />
            Event Participants
          </SheetTitle>
          <SheetDescription>
            Manage participants for "{eventTitle}"
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Add Participant */}
          <div className="glass-card p-4">
            <Label htmlFor="participant-email" className="text-sm font-medium">
              Add Participant
            </Label>
            <form onSubmit={handleAddParticipant} className="flex gap-2 mt-2">
              <Input
                id="participant-email"
                type="email"
                placeholder="participant@example.com"
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
                disabled={isAdding}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newParticipantEmail.trim() || isAdding}
                className="gradient-primary hover:opacity-90"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Participants List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Current Participants</h3>
              <Badge variant="secondary">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No participants yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add someone using the form above
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.email}
                    className="glass-card p-3 flex items-center justify-between group hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {participant.name} {participant.surname}
                        </p>
                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveParticipant(
                          participant.email,
                          `${participant.name} ${participant.surname}`
                        )
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
