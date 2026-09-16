import React from 'react';
import { EventItem, User } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  currentUser: User | null;
  onRegister: (eventId: string) => void;
  isRegistering: boolean;
  onOpenAuth: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  currentUser,
  onRegister,
  isRegistering,
  onOpenAuth,
}) => {
  if (!event) return null;

  const isFull = event.placesLeft <= 0;
  const isRegistered = event.isRegisteredByCurrentUser;
  const todayStr = new Date().toISOString().split('T')[0];
  const isPast = event.date < todayStr;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  const isDraft = event.status === 'draft';

  const occupancyPercent = Math.min(
    100,
    Math.round((event.registeredCount / Math.max(1, event.capacity)) * 100)
  );

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="event-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 border-b border-stone-100 pb-6">
          <button
            id="close-event-detail-btn"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                event.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : event.status === 'draft'
                  ? 'bg-amber-100 text-amber-800'
                  : event.status === 'completed'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {event.status} Event
            </span>

            {isRegistered && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                You are Registered
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            {event.title}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                  Date
                </div>
                <div className="text-xs font-semibold text-stone-900 mt-0.5">
                  {formatDate(event.date)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                  Time
                </div>
                <div className="text-xs font-semibold text-stone-900 mt-0.5">
                  {event.time}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                  Location
                </div>
                <div className="text-xs font-semibold text-stone-900 mt-0.5 leading-snug">
                  {event.location}
                </div>
              </div>
            </div>
          </div>

          {/* Capacity and Availability Box */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-600" />
                <span className="text-sm font-semibold text-stone-800">Places Availability</span>
              </div>
              <div className="text-sm font-bold text-stone-900">
                {event.placesLeft}{' '}
                <span className="font-normal text-stone-500">
                  places available of {event.capacity} total
                </span>
              </div>
            </div>

            <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isFull ? 'bg-rose-500' : occupancyPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-stone-500">
              <span>{event.registeredCount} attendees booked</span>
              <span>{occupancyPercent}% capacity reached</span>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
              About This Event
            </h4>
            <p className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Organizer Guarantee note */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Nowshera Events Guarantee:</span> Your booking guarantees your place. Real-time capacity controls prevent overbooking. If your schedule changes, you can cancel at any time to release your seat for another community member.
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Close
          </button>

          <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            {!currentUser ? (
              <button
                id="modal-login-to-register-btn"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
              >
                Sign In to Register
              </button>
            ) : isRegistered ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>You're registered for this event</span>
              </div>
            ) : isFull ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>This event is completely booked</span>
              </div>
            ) : isPast ? (
              <div className="px-4 py-2.5 bg-stone-200 rounded-xl text-stone-600 text-sm font-medium">
                Event has already passed
              </div>
            ) : isDraft ? (
              <div className="px-4 py-2.5 bg-amber-100 rounded-xl text-amber-800 text-sm font-medium">
                Draft Event (Admin Preview)
              </div>
            ) : isCancelled || isCompleted ? (
              <div className="px-4 py-2.5 bg-stone-200 rounded-xl text-stone-600 text-sm font-medium capitalize">
                Event {event.status}
              </div>
            ) : (
              <button
                id={`modal-register-confirm-btn-${event.id}`}
                onClick={() => onRegister(event.id)}
                disabled={isRegistering}
                className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <span>Securing your seat...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Confirm Registration</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
