import {
  User,
  Event,
  CreateEventPayload,
  AuthResponse,
  MessageResponse,
  ApiError,
  ProfileForm
} from './types';

const BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private redirectToLogin(): void {
    this.clearToken();
    window.location.href = '/login';
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(url, { ...options, headers });

      // Kick user back to login if JWT is missing/invalid/expired
      if (response.status === 401 || response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        const code = errorData?.error?.code;
        if (code && ['JWT_MISSING', 'JWT_INVALID', 'JWT_EXPIRED'].includes(code)) {
          this.redirectToLogin();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = errorData?.error || { code: 'UNKNOWN_ERROR', message: 'Request failed' };
        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw { code: 'NETWORK_ERROR', message: 'Network request failed' } as ApiError;
    }
  }

  // -------- Auth --------
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // -------- Chat --------
  async queryPrompt(prompt: string): Promise<any> {
    const encodedPrompt = encodeURIComponent(prompt);
    return this.request<any>(`/app/prompt?prompt=${encodedPrompt}`);
  }

  // -------- Users --------
  async createUser(user: { name: string; surname: string; email: string; password: string }): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.request<User>(`/users/email/${encodeURIComponent(email)}`);
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async updateUser(updated: ProfileForm) {
    // Placeholder until backend update route exists
    return updated;
  }

  // -------- Events --------
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  async createEvent(payload: CreateEventPayload): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getEventByTitle(title: string): Promise<Event> {
    return this.request<Event>(`/events/title/${encodeURIComponent(title)}`);
  }

  // Frontend filtering instead of backend endpoints
  async getEventsByLocation(location: string): Promise<Event[]> {
    const events = await this.getEvents();
    return events.filter(
      e => e.location?.trim().toLowerCase() === location.trim().toLowerCase()
    );
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    const events = await this.getEvents();
    return events.filter(
      e => e.category?.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }

  async getEventsByOrganizer(email: string): Promise<Event[]> {
    return this.request<Event[]>(`/events/organizer/${encodeURIComponent(email)}`);
  }

  async getEventsByDate(dateYYYYMMDD: string): Promise<Event[]> {
    return this.request<Event[]>(`/events/date/${dateYYYYMMDD}`);
  }

  // Distinct lists computed client-side
  async getCategories(): Promise<string[]> {
    const events = await this.getEvents();
    const categories = events
      .map(e => e.category?.trim())
      .filter((c): c is string => !!c && c.length > 0);
    return Array.from(new Set(categories)).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }

  async getLocations(): Promise<string[]> {
    const events = await this.getEvents();
    const locations = events
      .map(e => e.location?.trim())
      .filter((l): l is string => !!l && l.length > 0);
    return Array.from(new Set(locations)).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }

  // -------- Participants --------
  async listParticipants(eventId: number): Promise<User[]> {
    return this.request<User[]>(`/app/${eventId}/participants`);
  }

  async addParticipant(eventId: number, userEmail: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(
      `/app/${eventId}/participants/${encodeURIComponent(userEmail)}`,
      { method: 'POST' },
    );
  }

  async removeParticipant(eventId: number, userEmail: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(
      `/app/${eventId}/participants/${encodeURIComponent(userEmail)}`,
      { method: 'DELETE' },
    );
  }
}

// Export both to cover all usage patterns
export const apiClient = new ApiClient();
export const api = apiClient;
export default apiClient;
