import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import {
  X,
  LogIn,
  UserPlus,
  Shield,
  User as UserIcon,
  AlertCircle,
  Loader2,
  KeyRound,
  Check
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

type RoleKey = 'admin' | 'attendee';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedKey, setSelectedKey] = useState<RoleKey>('admin');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectRoleKey = (key: RoleKey) => {
    setSelectedKey(key);
    setError(null);
    setEmail('');
    setName('');
    setPassword('');
  };

  const isAdminEmail =
    selectedKey === 'admin' ||
    email.trim().toLowerCase() === 'alishbamanzoor372@gmail.com' ||
    email.trim().toLowerCase() === 'alishbamanzoor909@gmail.com' ||
    email.trim().toLowerCase().startsWith('admin@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="auth-modal-dialog"
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-stone-900">
              Access Keys: Admin or Attendee
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TWO KEYS */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Key 1: Admin */}
          <button
            type="button"
            id="modal-key-admin-btn"
            onClick={() => handleSelectRoleKey('admin')}
            className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
              selectedKey === 'admin'
                ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  selectedKey === 'admin' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                <Shield className="w-4 h-4" />
              </div>
              {selectedKey === 'admin' && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Key 1
                </span>
              )}
            </div>
            <div className="font-extrabold text-stone-900 text-sm">Admin Key</div>
            <div className="text-[11px] text-stone-500 leading-tight mt-0.5">Operations Site</div>
          </button>

          {/* Key 2: Attendee */}
          <button
            type="button"
            id="modal-key-attendee-btn"
            onClick={() => handleSelectRoleKey('attendee')}
            className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
              selectedKey === 'attendee'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  selectedKey === 'attendee' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                <UserIcon className="w-4 h-4" />
              </div>
              {selectedKey === 'attendee' && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Key 2
                </span>
              )}
            </div>
            <div className="font-extrabold text-stone-900 text-sm">Attendee Key</div>
            <div className="text-[11px] text-stone-500 leading-tight mt-0.5">Event Bookings</div>
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 ${
              isAdminEmail
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>
                  {isAdminEmail
                    ? 'Sign In to Admin Site'
                    : 'Sign In as Attendee'}
                </span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>
                  {isAdminEmail
                    ? 'Create Admin & Open Admin Site'
                    : 'Create Attendee Account'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
