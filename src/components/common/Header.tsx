import React, { useState } from 'react';
import { Bell, ShieldCheck, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications
}) => {
  const { user, logout, unreadCount, quickLoginAs } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const demoAccounts = [
    { label: 'Adaeze Okafor (Regular User)', email: 'adaeze@kudiflow.ng', pass: 'NaijaFlow2026!', tag: '@adaeze', balance: '₦385,000' },
    { label: 'Babatunde Adeleke (User)', email: 'babatunde@kudiflow.ng', pass: 'TundePass2026!', tag: '@tunde', balance: '₦195,000' },
    { label: 'Oluwaseun Balogun (Admin)', email: 'shopatstylestessentials@gmail.com', pass: 'AdminPass2026!', tag: '@seun_admin', balance: '₦1,450,000' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black text-base shadow-sm shadow-emerald-200 font-display">
              ₦
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">
              KudiFlow
            </span>
          </button>

          {user?.role === 'admin' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
          )}
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors hover:text-slate-900 pb-0.5 ${
              activeTab === 'dashboard' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`transition-colors hover:text-slate-900 pb-0.5 ${
              activeTab === 'wallet' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`transition-colors hover:text-slate-900 pb-0.5 ${
              activeTab === 'budgets' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
            }`}
          >
            Budgets
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`transition-colors hover:text-slate-900 pb-0.5 ${
              activeTab === 'savings' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
            }`}
          >
            Savings
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`transition-colors hover:text-slate-900 pb-0.5 ${
              activeTab === 'transactions' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`transition-colors hover:text-slate-900 pb-0.5 ${
              activeTab === 'analytics' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
            }`}
          >
            Analytics
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`transition-colors hover:text-slate-900 pb-0.5 flex items-center gap-1 ${
                activeTab === 'admin' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : 'text-slate-600'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Notifications, Demo account switcher, User profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher for fast verification */}
          <div className="relative">
            <button
              onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Switch demo account"
            >
              <span className="truncate max-w-[90px] sm:max-w-none">{user?.kudiTag || 'Switch User'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {showAccountSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Test Personas (One-Click)
                </div>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={async () => {
                      setShowAccountSwitcher(false);
                      await quickLoginAs(acc.email, acc.pass);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between transition-colors ${
                      user?.email === acc.email ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{acc.label}</div>
                      <div className="text-[10px] text-slate-400">{acc.tag}</div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600">{acc.balance}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white" />
            )}
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
            >
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=KD'}
                alt={user?.name || 'User'}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 bg-slate-100"
                referrerPolicy="no-referrer"
              />
              <span className="hidden lg:inline text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.kudiTag}</p>
                  <p className="text-[10px] text-emerald-700 font-mono mt-0.5">{user?.accountNumber} (Providus)</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setActiveTab('profile');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>Profile & Security</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('admin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Admin Console</span>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
