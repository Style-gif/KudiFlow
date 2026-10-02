import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Trash2, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { apiClient } from '../../api/client';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllNotificationsRead, refreshNotifications } = useAuth();
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  const handleClear = async () => {
    try {
      await apiClient.clearNotifications();
      await refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (item: NotificationItem) => {
    switch (item.type) {
      case 'budget':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'savings':
        return <Sparkles className="h-4 w-4 text-emerald-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-800" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900">Notifications</h2>
              <span className="text-xs text-slate-400 font-mono">({notifications.length})</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Filter tabs & actions */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <Bell className="h-10 w-10 text-slate-200 mb-2" />
                <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Alerts for your wallet transactions, budgets, and security will appear here.</p>
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl transition-colors mb-1 ${
                    !item.read ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 rounded-lg p-1.5 bg-white shadow-xs border border-slate-100">
                      {getIcon(item)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formatRelativeTime(item.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed break-words">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
