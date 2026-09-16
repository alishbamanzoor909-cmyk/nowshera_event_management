import React, { useState } from 'react';
import { User } from '../types';
import {
  CalendarDays,
  User as UserIcon,
  Shield,
  LogOut,
  CheckCircle2,
  Menu,
  X,
  Users,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'login' | 'events' | 'my-registrations' | 'admin';
  onSelectTab: (tab: 'login' | 'events' | 'my-registrations' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickSwitch: (role: 'admin' | 'attendee', email?: string) => void;
  myRegistrationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onLogout,
  onQuickSwitch,
  myRegistrationsCount,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const demoUsers = [
    { name: 'Alishba Manzoor (Admin)', email: 'alishbamanzoor372@gmail.com', role: 'admin' as const },
    { name: 'Admin (Nowshera Events)', email: 'admin@nowsheraevents.com', role: 'admin' as const },
    { name: 'Sarah Khan', email: 'sarah@example.com', role: 'attendee' as const },
    { name: 'Tariq Mahmood', email: 'tariq@example.com', role: 'attendee' as const },
    { name: 'Zainab Ali', email: 'zainab@example.com', role: 'attendee' as const },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab(currentUser ? (currentUser.role === 'admin' ? 'admin' : 'events') : 'login')}
              className="flex items-center gap-3 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-amber-700 transition-colors">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-stone-900 text-lg tracking-tight block leading-tight">
                  Nowshera Events Co.
                </span>
                <span className="text-xs text-stone-500 block">
                  Registration &amp; Operations Portal
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!currentUser && (
              <button
                id="nav-login-tab-btn"
                onClick={() => onSelectTab('login')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <LogIn className="w-4 h-4 text-amber-700" />
                <span>Sign In &amp; Log In</span>
              </button>
            )}

            {/* Attendee Navigation */}
            {currentUser && currentUser.role === 'attendee' && (
              <>
                <button
                  id="nav-browse-events-btn"
                  onClick={() => onSelectTab('events')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'events'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Browse Events
                </button>

                <button
                  id="nav-my-registrations-btn"
                  onClick={() => onSelectTab('my-registrations')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'my-registrations'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <span>My Registrations</span>
                  {myRegistrationsCount > 0 && (
                    <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {myRegistrationsCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Admin Navigation */}
            {currentUser && currentUser.role === 'admin' && (
              <button
                id="nav-admin-dashboard-btn"
                onClick={() => onSelectTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-stone-900 text-white font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Site</span>
              </button>
            )}
          </nav>

          {/* Right Action: User Status & Quick Role Switch */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                id="quick-role-switch-btn"
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="px-2.5 py-1.5 text-xs font-medium border border-stone-200 rounded-lg text-stone-700 bg-stone-50 hover:bg-stone-100 flex items-center gap-1.5 transition-colors"
                title="Switch demo account for quick testing"
              >
                <Users className="w-3.5 h-3.5 text-stone-500" />
                <span>Switch User</span>
              </button>

              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Quick Role / Account Switch
                  </div>
                  {demoUsers.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => {
                        onQuickSwitch(u.role, u.email);
                        setShowSwitchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                        currentUser?.email === u.email ? 'bg-amber-50/70 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <div className="text-stone-900">{u.name}</div>
                        <div className="text-stone-500 text-[11px]">{u.email}</div>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current User Pill or Sign In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="text-right">
                  <div className="text-xs font-medium text-stone-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-stone-500 capitalize flex items-center justify-end gap-1">
                    {currentUser.role === 'admin' ? (
                      <span className="inline-flex items-center gap-0.5 text-purple-700 font-semibold">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                        <UserIcon className="w-3 h-3" /> Attendee
                      </span>
                    )}
                  </div>
                </div>
                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="sign-in-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 text-sm font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {!currentUser && (
            <button
              id="mobile-nav-login-btn"
              onClick={() => {
                onSelectTab('login');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                  : 'text-stone-800 hover:bg-stone-50'
              }`}
            >
              <LogIn className="w-4 h-4 text-amber-700" />
              <span>Sign In &amp; Log In</span>
            </button>
          )}
          {currentUser && currentUser.role === 'attendee' && (
            <>
              <button
                onClick={() => {
                  onSelectTab('events');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-stone-800 font-medium"
              >
                Browse Events
              </button>
              <button
                onClick={() => {
                  onSelectTab('my-registrations');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-stone-800 font-medium flex items-center justify-between"
              >
                <span>My Registrations</span>
                {myRegistrationsCount > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {myRegistrationsCount}
                  </span>
                )}
              </button>
            </>
          )}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-stone-800 font-medium flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Admin Site</span>
            </button>
          )}

          <div className="pt-3 border-t border-stone-100">
            <div className="text-xs font-semibold text-stone-400 mb-2 uppercase">Switch User</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => {
                    onQuickSwitch(u.role, u.email);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs p-2 rounded-lg border border-stone-200 hover:bg-stone-50"
                >
                  <div className="font-semibold text-stone-800 truncate">{u.name}</div>
                  <div className="text-[10px] text-stone-500 uppercase">{u.role}</div>
                </button>
              ))}
            </div>

            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-rose-600 text-sm font-medium border border-rose-200 rounded-lg"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center bg-stone-900 text-white text-sm font-medium rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
