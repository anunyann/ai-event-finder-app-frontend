export type User = {
  name: string;
  surname: string;
  email: string;
};

export type Event = {
  title: string;
  description: string;
  datetime: string;            // ISO-like string from API; format for display
  location: string;
  category: string;
  guests?: Array<Pick<User, "name" | "surname">>;
  organizer?: User;            // name, surname, email when present
};

export type ApiError = {
  error?: { code: string; message: string; fields?: Record<string, string[]> };
} | string;

export type CreateEventPayload = {
  title: string;
  description: string;
  datetime: string; // "YYYY-MM-DD HH:mm:ss"
  location: string;
  category: string;
  organizer_email: string;
};

export type AuthResponse = {
  access_token: string;
};

export type ChatResponse = {
  message?: string;
  events?: Event[];
};

export type MessageResponse = {
  message: string;
};