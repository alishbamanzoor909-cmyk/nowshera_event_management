import React, { useState, useEffect } from 'react';
import { EventItem, DashboardStats, EventStatus, User } from '../types';
import { api } from '../api';
import { BackendConsole } from './BackendConsole';
import {
  CalendarDays,
  Plus,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  FileEdit,
  Eye,
  Send,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Check,
  Building,
  Shield,
  Loader2,
  Trash2,
  Lock,
  Server,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser?: User | null;
  onViewAttendees: (event: EventItem) => void;
  onRefreshEvents: () => void;
  onOpenAuth?: () => void;
  onQuickSwitchToAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onViewAttendees,
  onRefreshEvents,
  onOpenAuth,
  onQuickSwitchToAdmin,
}) => {
  const [activeAdminSection, setActiveAdminSection] = useState<'events' | 'backend'>('events');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00',
    location: '',
    capacity: '25',
    status: 'draft' as 'draft' | 'published',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.role]);

  // Security Gate: Attendee cannot manage events & Admin cannot use admin pages without signing in
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Role-Based Access Control
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-3">
              Administrator Sign-In Required
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
              Admin operations and attendee roster lists are restricted to authenticated event team administrators. Attendees cannot manage events.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2 text-stone-600 max-w-md mx-auto">
            <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Access Rules Enforced:
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span><strong>Admin:</strong> Cannot use admin pages without signing in.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span><strong>Attendee:</strong> Cannot manage events, create schedules, or view other attendees' private info.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenAuth && (
              <button
                id="admin-access-login-btn"
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
              >
                Sign In with Admin Account
              </button>
            )}
            {onQuickSwitchToAdmin && (
              <button
                id="admin-access-quick-switch-btn"
                onClick={onQuickSwitchToAdmin}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
              >
                Sign In as Alishba Manzoor (Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, eventsData] = await Promise.all([
        api.getAdminDashboard(),
        api.getEvents(true), // All events including drafts
      ]);
      setStats(statsData);
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      time: '10:00',
      location: 'Nowshera Civic Center',
      capacity: '20',
      status: 'draft',
    });
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: String(event.capacity),
      status: event.status === 'draft' || event.status === 'published' ? event.status : 'published',
    });
    setFormError(null);
  };

  // Test 7: Capacity validation logic on frontend + backend
  const validateCapacityInput = (capacityStr: string, activeRegisteredCount = 0): { valid: boolean; error?: string; value?: number } => {
    const raw = capacityStr.trim();
    if (!raw) {
      return { valid: false, error: 'Event capacity cannot be blank.' };
    }

    const num = Number(raw);
    if (isNaN(num)) {
      return { valid: false, error: 'Capacity must be a numerical value.' };
    }

    if (!Number.isInteger(num)) {
      return { valid: false, error: 'Capacity cannot be a decimal (e.g. 2.5). It must be a whole integer.' };
    }

    if (num <= 0) {
      return { valid: false, error: 'Capacity must be greater than 0. Zero and negative numbers are not allowed.' };
    }

    if (num < activeRegisteredCount) {
      return {
        valid: false,
        error: `Capacity (${num}) cannot be less than the number of people already registered (${activeRegisteredCount}).`,
      };
    }

    return { valid: true, value: num };
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Event title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Event description is required.');
      return;
    }
    if (!formData.date.trim()) {
      setFormError('Event date is required.');
      return;
    }
    if (!formData.location.trim()) {
      setFormError('Event location is required.');
      return;
    }

    const currentActive = editingEvent ? editingEvent.registeredCount : 0;
    const capCheck = validateCapacityInput(formData.capacity, currentActive);
    if (!capCheck.valid) {
      setFormError(capCheck.error || 'Invalid capacity');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        // Edit existing
        await api.updateEvent(editingEvent.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          date: formData.date,
          time: formData.time,
          location: formData.location.trim(),
          capacity: capCheck.value!,
          status: formData.status,
        });
        setSuccessMessage(`Event "${formData.title}" updated successfully.`);
        setEditingEvent(null);
      } else {
        // Create new
        await api.createEvent({
          title: formData.title.trim(),
          description: formData.description.trim(),
          date: formData.date,
          time: formData.time,
          location: formData.location.trim(),
          capacity: capCheck.value!,
          status: formData.status,
        });
        setSuccessMessage(
          formData.status === 'published'
            ? `New event "${formData.title}" created and published!`
            : `New draft "${formData.title}" saved. Attendees cannot see it until published.`
        );
        setShowCreateModal(false);
      }

      await loadDashboardData();
      onRefreshEvents();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed on server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (event: EventItem, newStatus: EventStatus) => {
    try {
      await api.updateEvent(event.id, { status: newStatus });
      setSuccessMessage(`Event status updated to "${newStatus}".`);
      await loadDashboardData();
      onRefreshEvents();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all events and registrations back to clean initial demo state?')) return;
    try {
      await api.resetData();
      setSuccessMessage('Database reset to clean demonstration baseline.');
      await loadDashboardData();
      onRefreshEvents();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset data');
    }
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Administrator Control
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {currentUser?.email
                ? `Logged in as ${currentUser.name} (${currentUser.email})`
                : 'Nowshera Events Co. Operations'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Events Management &amp; Analytics
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Real-time control room: oversee event capacities, publish schedules, and manage attendee rosters.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            id="admin-reset-demo-data-btn"
            onClick={handleResetData}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Reset database to initial demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            id="admin-create-event-btn"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-sm font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation: Events vs Backend */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          id="admin-subtab-events"
          onClick={() => setActiveAdminSection('events')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeAdminSection === 'events'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Events &amp; Capacities</span>
        </button>

        <button
          id="admin-subtab-backend"
          onClick={() => setActiveAdminSection('backend')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeAdminSection === 'backend'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Server className="w-4 h-4 text-amber-500" />
          <span>Backend &amp; Database Engine</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeAdminSection === 'backend' ? (
        <BackendConsole />
      ) : (
        <>
          {/* KPI Metric Cards (PRD Test 10) */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Events</span>
              <CalendarDays className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">
              {stats.totalEvents}
            </div>
            <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-2">
              <span>{stats.publishedEvents} published</span>
              <span>•</span>
              <span>{stats.draftEvents} drafts</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Registrations</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {stats.totalRegistrations}
            </div>
            <div className="text-[11px] text-stone-500 mt-2">
              Confirmed attendees across all events
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Places Available</span>
              <Building className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-700">
              {stats.totalAvailablePlaces}
            </div>
            <div className="text-[11px] text-stone-500 mt-2">
              Unfilled capacity in published events
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Closed Events</span>
              <CheckCircle className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-800">
              {stats.completedEvents + stats.cancelledEvents}
            </div>
            <div className="text-[11px] text-stone-500 mt-2">
              {stats.completedEvents} completed, {stats.cancelledEvents} cancelled
            </div>
          </div>
        </div>
      )}

      {/* Events List Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Scheduled Events ({filteredEvents.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Drafts remain hidden from attendees until published.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-event-search-input"
                type="text"
                placeholder="Filter events..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900 w-44 sm:w-56"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-stone-200/60 p-1 rounded-xl text-xs font-medium">
              {['all', 'published', 'draft', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    statusFilter === tab
                      ? 'bg-white text-stone-900 font-bold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-stone-600" />
            <p className="text-sm font-medium">Loading events and rosters...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-stone-700">No events match filter</p>
            <p className="text-xs text-stone-500 mt-1">Try switching status tabs or clear search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-5">Event Title</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Capacity / Bookings</th>
                  <th className="py-3 px-4">Places Left</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((evt) => {
                  const isFull = evt.placesLeft <= 0;
                  return (
                    <tr key={evt.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-stone-900 text-sm max-w-xs sm:max-w-md">
                          {evt.title}
                        </div>
                        <div className="text-stone-500 text-xs mt-0.5 truncate max-w-xs">
                          {evt.location}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs whitespace-nowrap">
                        <div className="font-medium text-stone-800">{evt.date}</div>
                        <div className="text-stone-500">{evt.time}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            evt.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evt.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : evt.status === 'completed'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">
                            {evt.registeredCount}
                          </span>
                          <span className="text-stone-400">/</span>
                          <span className="text-stone-600 font-medium">{evt.capacity}</span>
                        </div>
                        <div className="w-24 bg-stone-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isFull ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (evt.registeredCount / Math.max(1, evt.capacity)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            isFull ? 'text-rose-600 font-bold' : 'text-stone-800'
                          }`}
                        >
                          {evt.placesLeft} {evt.placesLeft === 1 ? 'place' : 'places'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Attendees */}
                          <button
                            id={`admin-view-attendees-${evt.id}`}
                            onClick={() => onViewAttendees(evt)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1"
                            title="View registered attendees list and export"
                          >
                            <Users className="w-3.5 h-3.5 text-stone-600" />
                            <span>Roster ({evt.registeredCount})</span>
                          </button>

                          {/* Publish Shortcut if Draft (Test 2) */}
                          {evt.status === 'draft' && (
                            <button
                              id={`admin-publish-btn-${evt.id}`}
                              onClick={() => handleQuickStatusChange(evt, 'published')}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                              title="Publish so attendees can see and register"
                            >
                              <Send className="w-3 h-3" />
                              <span>Publish</span>
                            </button>
                          )}

                          {/* Mark Completed */}
                          {evt.status === 'published' && (
                            <button
                              onClick={() => handleQuickStatusChange(evt, 'completed')}
                              className="px-2 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Mark event as completed (closes registrations)"
                            >
                              Complete
                            </button>
                          )}

                          {/* Edit Event Capacity & Details */}
                          <button
                            id={`admin-edit-event-${evt.id}`}
                            onClick={() => handleOpenEdit(evt)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit event details or capacity"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* Create / Edit Event Modal with strict capacity validation (Test 7) */}
      {(showCreateModal || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  {editingEvent ? 'Update Event Parameters' : 'Organize New Community Event'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 sm:p-8 space-y-5">
              {formError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Event Title *
                </label>
                <input
                  id="event-form-title"
                  type="text"
                  required
                  placeholder="e.g. Digital Marketing Workshop for Artisans"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  id="event-form-description"
                  required
                  rows={3}
                  placeholder="Detailed overview of schedule, topics, speakers, and audience prerequisites..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Date (YYYY-MM-DD) *
                  </label>
                  <input
                    id="event-form-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Time (e.g. 10:00 AM) *
                  </label>
                  <input
                    id="event-form-time"
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM or 14:00"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Location Venue *
                </label>
                <input
                  id="event-form-location"
                  type="text"
                  required
                  placeholder="e.g. Nowshera Civic Center, Main Auditorium"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              {/* Capacity and Status Grid (Test 7 Validation Focus) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Capacity (Max Places) *
                    </label>
                    {editingEvent && (
                      <span className="text-[11px] text-stone-500 font-medium">
                        Currently registered: <strong>{editingEvent.registeredCount}</strong>
                      </span>
                    )}
                  </div>
                  <input
                    id="event-form-capacity"
                    type="text"
                    required
                    placeholder="e.g. 25"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-mono"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Whole integer &gt; 0. Decimals, zero, and values below registered count are rejected.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Publication Status *
                  </label>
                  <select
                    id="event-form-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                  >
                    <option value="draft">Draft (Hidden from attendees)</option>
                    <option value="published">Published (Open for attendee registration)</option>
                    {editingEvent && <option value="completed">Completed (Closed)</option>}
                    {editingEvent && <option value="cancelled">Cancelled (Closed)</option>}
                  </select>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Attendees only see published events.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-5 py-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  id="submit-event-form-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <span>{editingEvent ? 'Save Changes' : 'Create Event'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
