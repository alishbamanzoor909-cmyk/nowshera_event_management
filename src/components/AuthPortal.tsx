import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import {
  Shield,
  User as UserIcon,
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  CalendarDays,
  ArrowRight,
  KeyRound,
  Check
} from 'lucide-react';

interface AuthPortalProps {
  onSuccess: (user: User) => void;
}

type RoleKey = 'admin' | 'attendee';

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onSuccess,
}) => {
  const [selectedKey, setSelectedKey] = useState<RoleKey>('admin');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Switch between the two keys: Admin or Attendee
  const handleSelectRoleKey = (key: RoleKey) => {
    setSelectedKey(key);
    setError(null);
    setEmail('');
    setName('');
    setPassword('');
  };

  const isAdminSelected =
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
      } else {
        const res = await api.register(name, email, password);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold uppercase tracking-wider mb-3">
          <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
          <span>Nowshera Events Co.</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Sign In &amp; Log In Portal
        </h1>
        <p className="text-base text-stone-600 mt-2 max-w-md mx-auto">
          Select your portal access key to continue to the administrative console or attendee registration.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xl">
        {/* TWO KEYS: Admin or Attendee */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-stone-600" />
              <span>Select Access Key</span>
            </span>
            <span className="text-xs text-stone-400">Choose Admin or Attendee</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* KEY 1: ADMIN KEY */}
            <button
              type="button"
              id="key-admin-btn"
              onClick={() => handleSelectRoleKey('admin')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                selectedKey === 'admin'
                  ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/70 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    selectedKey === 'admin'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                {selectedKey === 'admin' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-stone-900 text-base sm:text-lg block leading-tight">
                  Admin Key
                </span>
                <span className="text-xs text-stone-600 mt-1 block">
                  Event Operations &amp; Roster Management
                </span>
              </div>
            </button>

            {/* KEY 2: ATTENDEE KEY */}
            <button
              type="button"
              id="key-attendee-btn"
              onClick={() => handleSelectRoleKey('attendee')}
              className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                selectedKey === 'attendee'
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/70 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    selectedKey === 'attendee'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                </div>
                {selectedKey === 'attendee' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-stone-900 text-base sm:text-lg block leading-tight">
                  Attendee Key
                </span>
                <span className="text-xs text-stone-600 mt-1 block">
                  Workshop Bookings &amp; Reservations
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Selected Key Status Note */}
        <div
          className={`p-3.5 rounded-2xl text-xs mb-6 flex items-start gap-2.5 border transition-colors ${
            selectedKey === 'admin'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}
        >
          {selectedKey === 'admin' ? (
            <>
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Admin Key Active</strong>
                Signing in with an administrator account will open the <strong>Admin Operations Site</strong> to create, edit, and publish events, configure capacities, and export attendee rosters.
              </div>
            </>
          ) : (
            <>
              <UserIcon className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Attendee Key Active</strong>
                Signing in will open the <strong>Events Catalog</strong> to browse published workshops, reserve seats, and manage personal bookings.
              </div>
            </>
          )}
        </div>

        {/* Mode Toggle: Sign In vs Create Account */}
        <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-6 text-sm font-bold">
          <button
            type="button"
            id="auth-mode-login-btn"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-mode-register-btn"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name *
              </label>
              <input
                id="portal-name-input"
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Email Address *
            </label>
            <input
              id="portal-email-input"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Password *
            </label>
            <input
              id="portal-password-input"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>

          <button
            id="portal-submit-btn"
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
              isAdminSelected
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
                  {isAdminSelected
                    ? 'Sign In to Admin Site'
                    : 'Sign In as Attendee'}
                </span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>
                  {isAdminSelected
                    ? 'Register & Open Admin Site'
                    : 'Register as Attendee'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
