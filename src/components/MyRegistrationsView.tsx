import React, { useState } from 'react';
import { Registration, User } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ticket,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

interface MyRegistrationsViewProps {
  registrations: Registration[];
  onCancelRegistration: (regId: string) => void;
  onBrowseEvents: () => void;
  isLoading: boolean;
  currentUser: User | null;
  onTestUnauthorizedAccess?: (regId: string) => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  registrations,
  onCancelRegistration,
  onBrowseEvents,
  isLoading,
  currentUser,
  onTestUnauthorizedAccess,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<Registration | null>(null);

  const activeRegistrations = registrations.filter((r) => r.status === 'registered');
  const pastCancelled = registrations.filter((r) => r.status === 'cancelled');

  const handleConfirmCancel = async () => {
    if (!confirmCancelModal) return;
    setCancellingId(confirmCancelModal.id);
    try {
      await onCancelRegistration(confirmCancelModal.id);
      setConfirmCancelModal(null);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Attendee Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            My Registrations
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            View your confirmed event passes and manage attendance reservations.
          </p>
        </div>

        <button
          onClick={onBrowseEvents}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors self-start sm:self-auto shadow-xs"
        >
          <span>Explore More Events</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-600" />
          <p className="text-sm font-medium">Loading your registrations...</p>
        </div>
      ) : activeRegistrations.length === 0 && pastCancelled.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">
            No Registrations Found
          </h3>
          <p className="text-sm text-stone-500 mb-6 leading-relaxed">
            You haven't registered for any events yet. Check out the upcoming schedule of workshops, seminars, and community sessions!
          </p>
          <button
            onClick={onBrowseEvents}
            className="px-6 py-2.5 text-sm font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
          >
            Browse Available Events
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Registrations */}
          {activeRegistrations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Active Bookings ({activeRegistrations.length})</span>
                </h2>
                <span className="text-xs text-stone-500">
                  Confirmed seats held in real-time
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeRegistrations.map((reg) => {
                  const event = reg.event;
                  return (
                    <div
                      key={reg.id}
                      id={`registration-card-${reg.id}`}
                      className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Confirmed Place
                          </span>
                          <span className="text-[11px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                            Ref: {reg.id.slice(0, 10)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 mb-2 leading-snug">
                          {event?.title || 'Registered Event'}
                        </h3>

                        <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-medium text-stone-800">
                              {formatDate(event?.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{event?.time || '10:00'} PST</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{event?.location}</span>
                          </div>
                        </div>

                        <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 text-[11px] text-stone-500 mb-4 flex justify-between items-center">
                          <span>Attendee: <strong>{reg.userName}</strong></span>
                          <span>Booked: {formatTimestamp(reg.registeredAt)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-400">
                          Place guaranteed
                        </span>

                        <button
                          id={`cancel-reg-btn-${reg.id}`}
                          onClick={() => setConfirmCancelModal(reg)}
                          disabled={cancellingId === reg.id}
                          className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past / Cancelled History */}
          {pastCancelled.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <h3 className="text-md font-bold text-stone-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-stone-400" />
                <span>Cancelled / Inactive History ({pastCancelled.length})</span>
              </h3>

              <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
                {pastCancelled.map((reg) => (
                  <div key={reg.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-stone-800 text-sm">
                        {reg.event?.title || 'Event'}
                      </div>
                      <div className="text-stone-500 mt-0.5 flex items-center gap-3">
                        <span>Event Date: {reg.event?.date || 'N/A'}</span>
                        <span>•</span>
                        <span>Cancelled on: {reg.cancelledAt ? formatTimestamp(reg.cancelledAt) : 'N/A'}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-semibold bg-stone-100 text-stone-600 self-start sm:self-center">
                      Cancelled (Place Released)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Cancelling */}
      {confirmCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900">
                Cancel Registration?
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Are you sure you want to cancel your registration for{' '}
                <strong className="text-stone-900">
                  {confirmCancelModal.event?.title}
                </strong>
                ?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Your place will be released immediately so another attendee can register.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmCancelModal(null)}
                disabled={cancellingId !== null}
                className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
              >
                Keep My Seat
              </button>
              <button
                id="confirm-cancel-registration-btn"
                onClick={handleConfirmCancel}
                disabled={cancellingId !== null}
                className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                {cancellingId ? (
                  <span>Releasing Seat...</span>
                ) : (
                  <span>Yes, Cancel Registration</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
