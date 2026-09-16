import React from 'react';
import { EventItem, User } from '../types';
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  currentUser: User | null;
  onRegister: (eventId: string) => void;
  onViewDetails: (event: EventItem) => void;
  isRegistering?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentUser,
  onRegister,
  onViewDetails,
  isRegistering = false,
}) => {
  const isFull = event.placesLeft <= 0;
  const isRegistered = event.isRegisteredByCurrentUser;
  const todayStr = new Date().toISOString().split('T')[0];
  const isPast = event.date < todayStr;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  const isDraft = event.status === 'draft';

  // Format date nicely e.g. "Thu, 15 Oct 2026"
  const formatDate = (dateStr: string) => {
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

  // Occupancy percentage
  const occupancyPercent = Math.min(
    100,
    Math.round((event.registeredCount / Math.max(1, event.capacity)) * 100)
  );

  return (
    <div
      id={`event-card-${event.id}`}
      className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
    >
      <div className="p-6">
        {/* Status Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {event.status === 'published' && !isPast && !isFull && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Open for Registration
              </span>
            )}
            {isFull && event.status === 'published' && !isPast && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Fully Booked
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                Event Ended
              </span>
            )}
            {isDraft && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Draft (Admins Only)
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Completed
              </span>
            )}
            {isCancelled && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <XCircle className="w-3 h-3 mr-1" />
                Cancelled
              </span>
            )}
          </div>

          {isRegistered && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-teal-600" />
              Booked
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(event)}
          className="text-lg font-bold text-stone-900 mb-2 leading-snug cursor-pointer hover:text-amber-700 transition-colors line-clamp-2"
        >
          {event.title}
        </h3>

        {/* Description preview */}
        <p className="text-stone-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Meta details */}
        <div className="space-y-2 text-xs text-stone-600 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium text-stone-800">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Capacity bar and figures */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-stone-600 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              Capacity:
            </span>
            <span className="font-bold text-stone-900">
              {event.placesLeft}{' '}
              <span className="font-normal text-stone-500">
                places left of {event.capacity}
              </span>
            </span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isFull ? 'bg-rose-500' : occupancyPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-stone-400 mt-1">
            <span>{event.registeredCount} registered</span>
            <span>{occupancyPercent}% full</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="px-6 py-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between gap-3">
        <button
          id={`view-details-btn-${event.id}`}
          onClick={() => onViewDetails(event)}
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 py-2 px-3 rounded-lg hover:bg-stone-100 transition-colors"
        >
          View Details
        </button>

        {isRegistered ? (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Registered
          </span>
        ) : isFull ? (
          <button
            disabled
            className="text-xs font-semibold text-stone-400 bg-stone-100 px-4 py-2 rounded-lg cursor-not-allowed border border-stone-200"
            title="Event is completely full"
          >
            Full
          </button>
        ) : isPast ? (
          <button
            disabled
            className="text-xs font-semibold text-stone-400 bg-stone-100 px-4 py-2 rounded-lg cursor-not-allowed border border-stone-200"
          >
            Closed (Past)
          </button>
        ) : isCancelled || isCompleted ? (
          <button
            disabled
            className="text-xs font-semibold text-stone-400 bg-stone-100 px-4 py-2 rounded-lg cursor-not-allowed border border-stone-200"
          >
            Registration Closed
          </button>
        ) : (
          <button
            id={`register-btn-${event.id}`}
            onClick={() => onRegister(event.id)}
            disabled={isRegistering}
            className="text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isRegistering ? (
              <span>Registering...</span>
            ) : (
              <>
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
