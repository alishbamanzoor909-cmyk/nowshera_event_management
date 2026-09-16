import React, { useState, useEffect } from 'react';
import { EventItem, Registration } from '../types';
import { api } from '../api';
import {
  X,
  Search,
  Copy,
  Download,
  Check,
  Users,
  UserCheck,
  Calendar,
  Clock,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface AttendeeListModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export const AttendeeListModal: React.FC<AttendeeListModalProps> = ({ event, onClose }) => {
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event) return;
    loadAttendees();
  }, [event, searchQuery]);

  const loadAttendees = async () => {
    if (!event) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getEventAttendees(event.id, searchQuery);
      setAttendees(data.attendees);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendee roster');
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return null;

  // Copy formatted attendee checklist to clipboard
  const handleCopyList = () => {
    if (attendees.length === 0) return;

    let text = `NOWSHERA EVENTS CO. - OFFICIAL ATTENDEE CHECK-IN ROSTER\n`;
    text += `Event: ${event.title}\n`;
    text += `Date & Time: ${event.date} at ${event.time}\n`;
    text += `Location: ${event.location}\n`;
    text += `Capacity: ${event.registeredCount} / ${event.capacity} (${event.placesLeft} places remaining)\n`;
    text += `Total Attendees Listed: ${attendees.length}\n`;
    text += `------------------------------------------------------------\n`;
    text += `[ ] Status | Name | Email | Booking Ref | Registered At\n`;
    text += `------------------------------------------------------------\n`;

    attendees.forEach((att, idx) => {
      const regTime = new Date(att.registeredAt).toLocaleString();
      text += `[ ] #${idx + 1} | ${att.userName} | ${att.userEmail} | ${att.id} | ${regTime}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export CSV file for download
  const handleExportCSV = () => {
    if (attendees.length === 0) return;

    const headers = ['Check-in Status', 'Attendee Name', 'Email Address', 'Booking ID', 'Registration Timestamp', 'Event Title', 'Event Date'];
    const rows = attendees.map((att) => [
      'Confirmed',
      `"${att.userName.replace(/"/g, '""')}"`,
      `"${att.userEmail.replace(/"/g, '""')}"`,
      `"${att.id}"`,
      `"${new Date(att.registeredAt).toLocaleString()}"`,
      `"${event.title.replace(/"/g, '""')}"`,
      `"${event.date}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    link.setAttribute('download', `Nowshera_Attendees_${sanitizedTitle}_${event.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="attendee-roster-modal"
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-stone-200 bg-stone-50/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                Admin Operations
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Live Check-in Roster
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {event.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {event.time}
              </span>
              <span className="flex items-center gap-1 font-semibold text-stone-900">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                {event.registeredCount} active attendees / {event.capacity} total places
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Actions */}
        <div className="p-4 sm:px-8 border-b border-stone-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="attendee-search-input"
              type="text"
              placeholder="Search by attendee name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          {/* Export & Copy buttons */}
          <div className="flex items-center gap-2">
            <button
              id="copy-attendee-list-btn"
              onClick={handleCopyList}
              disabled={attendees.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
              title="Copy formatted checklist to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">List Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={attendees.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
              title="Download CSV spreadsheet for check-in desk"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-stone-600" />
              <p className="text-sm">Refreshing attendee list...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-semibold text-stone-700">
                {searchQuery ? 'No attendees match your search' : 'No registered attendees yet'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {searchQuery
                  ? 'Try searching with a different name or email fragment.'
                  : 'Registrations will appear here in real-time as community members book places.'}
              </p>
            </div>
          ) : (
            <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Registered At</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendees.map((att, idx) => (
                    <tr
                      key={att.id}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-stone-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                          {att.userName.charAt(0)}
                        </div>
                        <span>{att.userName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-mono text-xs">
                        {att.userEmail}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {att.id}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 text-xs whitespace-nowrap">
                        {new Date(att.registeredAt).toLocaleDateString()}{' '}
                        {new Date(att.registeredAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <UserCheck className="w-3 h-3" />
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-8 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing <strong>{attendees.length}</strong> active registrations
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
