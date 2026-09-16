import React, { useState, useEffect } from 'react';
import { User, EventItem, Registration } from './types';
import { api, getStoredToken } from './api';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { MyRegistrationsView } from './components/MyRegistrationsView';
import { AdminDashboard } from './components/AdminDashboard';
import { AttendeeListModal } from './components/AttendeeListModal';
import { AuthModal } from './components/AuthModal';
import { AuthPortal } from './components/AuthPortal';
import {
  Search,
  Sparkles,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'events' | 'my-registrations' | 'admin'>('login');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

  // Modals
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [selectedEventForRoster, setSelectedEventForRoster] = useState<EventItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Search & Filter in Browse view
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState(false);

  // Status banners & feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isRegisteringEventId, setIsRegisteringEventId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Initial load
  useEffect(() => {
    initAuthAndData();
  }, []);

  const initAuthAndData = async () => {
    // Check existing authenticated session
    const token = getStoredToken();
    if (token) {
      try {
        const userRes = await api.getCurrentUser();
        setCurrentUser(userRes.user);
        if (userRes.user.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('events');
        }
      } catch {
        // Token invalid
        api.logout();
        setCurrentUser(null);
        setActiveTab('login');
      }
    } else {
      // Unauthenticated visitor: Open directly to Sign In & Log In site
      setCurrentUser(null);
      setActiveTab('login');
    }

    loadEvents();
  };

  // Whenever user changes, reload events & registrations
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'attendee') {
        loadMyRegistrations();
      }
      loadEvents();
    } else {
      setMyRegistrations([]);
      loadEvents();
    }
  }, [currentUser?.id, currentUser?.role]);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      // If admin, we can query events with their status
      const data = await api.getEvents(currentUser?.role === 'admin');
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load events', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadMyRegistrations = async () => {
    if (!currentUser || currentUser.role !== 'attendee') return;
    setIsLoadingRegistrations(true);
    try {
      const data = await api.getMyRegistrations();
      setMyRegistrations(data);
    } catch (err: any) {
      console.error('Failed to load registrations', err);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  // Registration handler (PRD Test 1, 3, 4, 5)
  const handleRegister = async (eventId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setIsRegisteringEventId(eventId);
    try {
      const res = await api.registerForEvent(eventId);
      showToast(res.message, 'success');

      // Update events list with new count and places left
      await loadEvents();
      if (currentUser.role === 'attendee') {
        await loadMyRegistrations();
      }

      if (selectedEventForDetail && selectedEventForDetail.id === eventId) {
        setSelectedEventForDetail(res.event);
      }
    } catch (err: any) {
      showToast(err.message || 'Registration could not be completed.', 'error');
    } finally {
      setIsRegisteringEventId(null);
    }
  };

  // Cancel registration handler (PRD Test 6)
  const handleCancelRegistration = async (registrationId: string) => {
    try {
      const res = await api.cancelRegistration(registrationId);
      showToast('Registration cancelled. Your place has been released for someone else.', 'info');
      await loadEvents();
      await loadMyRegistrations();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
    }
  };

  // Quick Switch user
  const handleQuickSwitch = async (role: 'admin' | 'attendee', email?: string) => {
    try {
      const res = await api.quickSwitch(role, email);
      setCurrentUser(res.user);
      showToast(`Switched account to ${res.user.name} (${res.user.role.toUpperCase()})`, 'info');
      if (res.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('events');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to switch user.', 'error');
    }
  };

  // Logout
  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveTab('login');
    showToast('Signed out successfully.', 'info');
  };

  // Filter events for attendee browse view
  const filteredEvents = events.filter((e) => {
    // Attendees only see published future events (or if admin is browsing, all)
    if (onlyAvailableFilter && e.placesLeft <= 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeRegistrationsCount = myRegistrations.filter((r) => r.status === 'registered').length;

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setActiveTab('login')}
        onLogout={handleLogout}
        onQuickSwitch={handleQuickSwitch}
        myRegistrationsCount={activeRegistrationsCount}
      />

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 text-sm ${
              toast.type === 'success'
                ? 'bg-stone-900 text-white border-stone-800'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-amber-800 text-white border-amber-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-200 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-white text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* VIEW 0: SIGN IN & LOG IN PORTAL (SHOWN WHEN NOT SIGNED IN) */}
        {!currentUser && (
          <AuthPortal
            onSuccess={(user) => {
              setCurrentUser(user);
              showToast(`Welcome, ${user.name}!`, 'success');
              if (user.role === 'admin') {
                setActiveTab('admin');
              } else {
                setActiveTab('events');
              }
            }}
          />
        )}

        {/* VIEW 1: ATTENDEE BROWSE EVENTS */}
        {currentUser && currentUser.role === 'attendee' && activeTab === 'events' && (
          <div>
            {/* Hero Banner Section */}
            <div className="bg-white border-b border-stone-200 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-4">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Official Registration System</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                    Nowshera Events &amp; Workshops
                  </h1>
                  <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed">
                    Reliable community workshops, seminars, and networking sessions. Instant booking confirmation with live capacity management — no overbooked seats, WhatsApp delays, or lost spreadsheets.
                  </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="events-search-input"
                      type="text"
                      placeholder="Search events by title, topic, or venue..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={onlyAvailableFilter}
                        onChange={(e) => setOnlyAvailableFilter(e.target.checked)}
                        className="rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <span>Only show available seats</span>
                    </label>

                    <button
                      onClick={loadEvents}
                      className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors"
                      title="Refresh event list"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
              {isLoadingEvents ? (
                <div className="py-24 flex flex-col items-center justify-center text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-600" />
                  <p className="text-sm font-medium">Checking live event capacities...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                  <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-stone-800">No events found</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {searchQuery
                      ? 'No scheduled events match your search keywords.'
                      : 'All upcoming events are currently booked or in preparation.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      currentUser={currentUser}
                      onRegister={handleRegister}
                      onViewDetails={setSelectedEventForDetail}
                      isRegistering={isRegisteringEventId === evt.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ATTENDEE MY REGISTRATIONS */}
        {currentUser && currentUser.role === 'attendee' && activeTab === 'my-registrations' && (
          <MyRegistrationsView
            registrations={myRegistrations}
            onCancelRegistration={handleCancelRegistration}
            onBrowseEvents={() => setActiveTab('events')}
            isLoading={isLoadingRegistrations}
            currentUser={currentUser}
          />
        )}

        {/* VIEW 3: ADMIN SITE (FOR ADMIN ROLE ONLY) */}
        {currentUser && currentUser.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onViewAttendees={setSelectedEventForRoster}
            onRefreshEvents={loadEvents}
            onOpenAuth={() => setAuthModalOpen(true)}
            onQuickSwitchToAdmin={() => handleQuickSwitch('admin', 'alishbamanzoor372@gmail.com')}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Nowshera Events Co. &copy; 2026. Unified Event Operations &amp; Registration Portal.
          </span>
          <div className="flex items-center gap-4 text-stone-400">
            <span>No overbooking</span>
            <span>•</span>
            <span>Real-time Capacity Checks</span>
            <span>•</span>
            <span>Role-Based Access</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        currentUser={currentUser}
        onRegister={handleRegister}
        isRegistering={isRegisteringEventId === selectedEventForDetail?.id}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Admin Attendee Roster Modal */}
      <AttendeeListModal
        event={selectedEventForRoster}
        onClose={() => setSelectedEventForRoster(null)}
      />

      {/* Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name}!`, 'success');
          if (user.role === 'admin') {
            setActiveTab('admin');
          } else {
            setActiveTab('events');
          }
        }}
      />
    </div>
  );
}
