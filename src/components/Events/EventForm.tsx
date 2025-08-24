import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatToApiDateTime } from '@/lib/format';
import { apiClient } from '@/api';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  datetime: z.date({ required_error: 'Date and time are required' }),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  category: z.string().min(1, 'Category is required'),
  organizer_email: z.string().email('Valid email is required'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    datetime: string;
    location: string;
    category: string;
    organizer_email: string;
  }) => Promise<void>;
  isLoading?: boolean;

  // NEW
  mode?: 'create' | 'edit';
  initial?: Partial<{
    title: string;
    description: string;
    datetime: Date;         // NOTE: as Date
    location: string;
    category: string;
    organizer_email: string;
  }>;
}

export function EventForm({ open, onOpenChange, onSubmit, isLoading, mode = 'create', initial }: EventFormProps) {
  const [timeValue, setTimeValue] = useState('18:00');
  const [categories, setCategories] = useState<string[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      datetime: initial?.datetime ?? undefined,
      location: initial?.location ?? '',
      category: initial?.category ?? '',
      organizer_email: initial?.organizer_email ?? '',
    },
  });

  // When initial changes (opening edit), reset form + time
  useEffect(() => {
    if (open && mode === 'edit' && initial) {
      form.reset({
        title: initial.title ?? '',
        description: initial.description ?? '',
        datetime: initial.datetime ?? undefined,
        location: initial.location ?? '',
        category: initial.category ?? '',
        organizer_email: initial.organizer_email ?? '',
      });
      if (initial.datetime instanceof Date) {
        const hh = String(initial.datetime.getHours()).padStart(2, '0');
        const mm = String(initial.datetime.getMinutes()).padStart(2, '0');
        setTimeValue(`${hh}:${mm}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  useEffect(() => {
    apiClient.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (data: EventFormData) => {
    const dateTime = new Date(data.datetime);
    const [hours, minutes] = timeValue.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const formattedData = {
      title: data.title,
      description: data.description,
      location: data.location,
      category: data.category,
      organizer_email: data.organizer_email,
      datetime: formatToApiDateTime(dateTime),
    };

    await onSubmit(formattedData);

    if (mode === 'create') {
      form.reset();
      setTimeValue('18:00');
    }
  };

  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details and save your changes.' : 'Fill in the details to create a new event. All fields are required.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
                {!isEdit && (<FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter event title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />)}



              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your event..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="datetime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-card" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Time</label>
                  <Input type="time" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} className="w-full" />
                </div>
              </div>

              {/* Location and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card">
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Organizer Email */}
                {!isEdit && (<FormField
                    control={form.control}
                    name="organizer_email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organizer Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="organizer@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />)}

            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-primary hover:opacity-90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Save Changes' : 'Create Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
