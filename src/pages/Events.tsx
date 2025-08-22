import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, MapPin, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import { Event } from '@/types';

import { Topbar } from '@/components/UI/Topbar';
import { EventCard } from '@/components/Events/EventCard';
import { EventForm } from '@/components/Events/EventForm';
import { ParticipantsDrawer } from '@/components/Participants/ParticipantsDrawer';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProfileModal from '@/components/Profile/ProfileModal.tsx';

export default function Events() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');

  // --- Edit modal state ---
  const [editOpen, setEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<{
    title: string;
    description: string;
    datetime: Date | undefined;
    location: string;
    category: string;
    organizer_email: string;
  } | null>(null);

  // --- Delete confirm state ---
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Dynamic categories from backend
  const [categories, setCategories] = useState<string[]>(['All Categories']);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | undefined>();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getEvents();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error: any) {
      toast({
        title: 'Error loading events',
        description: error.message || 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await apiClient.getCategories();
      const cleaned = Array.from(new Set((data || []).map((c) => (c ?? '').trim()).filter(Boolean)));
      setCategories(['All Categories', ...cleaned]);
    } catch (error: any) {
      toast({
        title: 'Error loading categories',
        description: error.message || 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query),
      );
    }

    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    if (selectedLocation.trim()) {
      const location = selectedLocation.toLowerCase();
      filtered = filtered.filter((event) => event.location.toLowerCase().includes(location));
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, selectedLocation]);

  const handleCreateEvent = async (eventData: any) => {
    setIsCreating(true);
    try {
      await apiClient.createEvent(eventData);
      toast({
        title: 'Event created successfully',
        description: `"${eventData.title}" has been created`,
        className: 'bg-success text-success-foreground',
      });
      setCreateFormOpen(false);
      await loadEvents();
      await loadCategories();
    } catch (error: any) {
      toast({
        title: 'Error creating event',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleManageParticipants = (title: string) => {
    setSelectedEventTitle(title);
    setParticipantsDrawerOpen(true);
  };

  // --- open edit modal with prefilled values ---
  const handleEdit = (event: Event) => {
    setOriginalTitle(event.title);
    setEditInitial({
      title: event.title,
      description: event.description ?? '',
      datetime: event.datetime ? new Date(event.datetime) : undefined,
      location: event.location ?? '',
      category: event.category ?? '',
      organizer_email: event.organizer?.email ?? '',
    });
    setEditOpen(true);
  };

  // --- save edit ---
  const handleEditSubmit = async (data: {
    title: string;
    description: string;
    datetime: string;
    location: string;
    category: string;
    organizer_email: string;
  }) => {
    if (!originalTitle) return;
    setIsUpdating(true);
    try {
      await apiClient.updateEvent(originalTitle, data);
      toast({
        title: 'Event updated',
        description: `"${data.title}" has been saved`,
        className: 'bg-success text-success-foreground',
      });
      setEditOpen(false);
      await loadEvents();
      await loadCategories();
    } catch (error: any) {
      toast({
        title: 'Error updating event',
        description: error.message || 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // --- open delete dialog ---
  const handleDelete = (event: Event) => {
    setDeleteTarget(event);
  };

  // --- confirm delete action ---
  const confirmDelete = async () => {
  if (!deleteTarget) return;

  // Optimistically remove from UI right away
  const title = deleteTarget.title;
  setEvents(prev => prev.filter(e => e.title !== title));
  setFilteredEvents(prev => prev.filter(e => e.title !== title));
  setDeleteTarget(null);

  try {
    await apiClient.deleteEvent(title);
    toast({
      title: 'Event deleted',
      description: `“${title}” has been removed`,
      className: 'bg-success text-success-foreground',
    });
    // Re-sync from server in the background
    await loadEvents();
    await loadCategories();
  } catch (error: any) {
    // If the delete fails, reload to revert optimistic UI
    await loadEvents();
    toast({
      title: 'Error deleting event',
      description: error.message || 'Failed to delete event',
      variant: 'destructive',
    });
  }
};

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedLocation('');
  };

  const uniqueLocations = Array.from(new Set(events.map((event) => event.location)));

  return (
    <div className="min-h-screen bg-background">
      <Topbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Events</h1>
            <p className="text-muted-foreground">Discover and manage events in your community</p>
          </div>

          <Button onClick={() => setCreateFormOpen(true)} className="gradient-primary hover:opacity-90 mt-4 lg:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder={isLoadingCategories ? 'Loading...' : selectedCategory} />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedLocation || 'All Locations'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card w-[200px]">
                <DropdownMenuLabel>Locations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedLocation('')}>All Locations</DropdownMenuItem>
                {uniqueLocations.slice(0, 10).map((location) => (
                  <DropdownMenuItem key={location} onClick={() => setSelectedLocation(location)}>
                    {location}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchQuery || selectedCategory !== 'All Categories' || selectedLocation) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing {filteredEvents.length} of {events.length} events
              </span>
              {filteredEvents.length !== events.length && <Badge variant="secondary">Filtered</Badge>}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {events.length === 0
                ? 'There are no events yet. Create the first one!'
                : 'No events match your current filters. Try adjusting your search criteria.'}
            </p>
            {events.length === 0 && (
              <Button onClick={() => setCreateFormOpen(true)} className="gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.title}
                event={event}
                onManageParticipants={() => handleManageParticipants(event.title)}
                onUserClick={(email) => {
  setTargetEmail(email);
  setProfileOpen(true);
}}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <EventForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onSubmit={handleCreateEvent}
        isLoading={isCreating}
        mode="create"
      />

      {/* Edit Modal */}
      <EventForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
        mode="edit"
        initial={editInitial ?? undefined}
      />

      {/* User modal */}
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} targetEmail={targetEmail} />

      {/* Participants Drawer */}
      <ParticipantsDrawer
        open={participantsDrawerOpen}
        onOpenChange={setParticipantsDrawerOpen}
        eventTitle={selectedEventTitle}
      />

      {/* Pretty Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be permanently deleted. This cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
