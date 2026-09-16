export type UserRole = 'attendee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  capacity: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  registeredCount: number;
  placesLeft: number;
  isRegisteredByCurrentUser?: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'registered' | 'cancelled';
  registeredAt: string;
  cancelledAt?: string;
  event?: EventItem;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalAvailablePlaces: number;
  totalCapacity: number;
  draftEvents: number;
  publishedEvents: number;
  completedEvents: number;
  cancelledEvents: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
