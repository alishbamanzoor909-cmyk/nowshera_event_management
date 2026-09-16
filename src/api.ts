import { User, EventItem, Registration, DashboardStats } from './types';

const TOKEN_KEY = 'nowshera_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || response.statusText || 'An unexpected error occurred';
    const err = new Error(errorMsg) as Error & { status?: number; data?: any };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

// Authentication API
export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async quickSwitch(role: 'admin' | 'attendee', email?: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/quick-switch', {
      method: 'POST',
      body: JSON.stringify({ role, email }),
    });
    setStoredToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      removeStoredToken();
    }
  },

  // Events
  async getEvents(all = false): Promise<EventItem[]> {
    return request<EventItem[]>(`/api/events${all ? '?all=true' : ''}`);
  },

  async getEvent(id: string): Promise<EventItem> {
    return request<EventItem>(`/api/events/${id}`);
  },

  async createEvent(eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    status: 'draft' | 'published';
  }): Promise<EventItem> {
    return request<EventItem>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  async updateEvent(
    id: string,
    eventData: Partial<{
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      capacity: number;
      status: 'draft' | 'published' | 'completed' | 'cancelled';
    }>
  ): Promise<EventItem> {
    return request<EventItem>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Registrations
  async registerForEvent(
    eventId: string
  ): Promise<{ success: boolean; message: string; registration: Registration; event: EventItem; placesLeft: number }> {
    return request<{ success: boolean; message: string; registration: Registration; event: EventItem; placesLeft: number }>(
      `/api/events/${eventId}/register`,
      {
        method: 'POST',
      }
    );
  },

  async getMyRegistrations(): Promise<Registration[]> {
    return request<Registration[]>('/api/registrations/my');
  },

  async getSingleRegistration(id: string): Promise<Registration> {
    return request<Registration>(`/api/registrations/${id}`);
  },

  async cancelRegistration(
    registrationId: string
  ): Promise<{ success: boolean; message: string; registration: Registration; placesLeft: number }> {
    return request<{ success: boolean; message: string; registration: Registration; placesLeft: number }>(
      `/api/registrations/${registrationId}/cancel`,
      {
        method: 'POST',
      }
    );
  },

  // Admin
  async getAdminDashboard(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/admin/dashboard');
  },

  async getEventAttendees(
    eventId: string,
    query = ''
  ): Promise<{ event: EventItem; attendees: Registration[]; count: number }> {
    const qParam = query ? `?q=${encodeURIComponent(query)}` : '';
    return request<{ event: EventItem; attendees: Registration[]; count: number }>(
      `/api/admin/events/${eventId}/attendees${qParam}`
    );
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/admin/reset-data', {
      method: 'POST',
    });
  },

  async checkHealth(): Promise<{ status: string; uptimeSeconds: number; timestamp: string }> {
    return request<{ status: string; uptimeSeconds: number; timestamp: string }>('/api/health');
  },

  async getBackendStatus(): Promise<{
    status: string;
    server: {
      engine: string;
      port: number;
      uptimeSeconds: number;
      memoryHeapUsedMb: number;
    };
    database: {
      storageType: string;
      filePath: string;
      fileSizeBytes: number;
      counts: {
        users: number;
        events: number;
        registrations: number;
        activeSessions: number;
      };
    };
    endpoints: {
      method: string;
      path: string;
      access: string;
      desc: string;
    }[];
  }> {
    return request('/api/backend/status');
  },

  async runPrdTestRunner(): Promise<{
    allPassed: boolean;
    results: {
      testNumber: number;
      name: string;
      description: string;
      passed: boolean;
      details: string;
    }[];
  }> {
    return request('/api/test-runner/run');
  },
};
