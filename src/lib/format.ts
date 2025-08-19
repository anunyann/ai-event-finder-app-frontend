import { format, parseISO } from 'date-fns';

export function formatEventDateTime(dateTimeString: string): string {
  try {
    const date = parseISO(dateTimeString);
    return format(date, 'EEE, dd MMM yyyy · HH:mm');
  } catch {
    return dateTimeString; // Fallback to original string if parsing fails
  }
}

export function formatToApiDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatDateOnly(dateTimeString: string): string {
  try {
    const date = parseISO(dateTimeString);
    return format(date, 'yyyy-MM-dd');
  } catch {
    return dateTimeString;
  }
}

export function parseApiDateTime(dateTimeString: string): Date {
  return parseISO(dateTimeString);
}