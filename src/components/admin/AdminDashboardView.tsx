import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  AlertTriangle,
  Activity,
  FileCheck,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { User, Transaction, AuditLog, SupportTicket, AdminStats } from '../../types';
import { formatNaira, formatDate } from '../../utils/format';

export const AdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'audit' | 'tickets'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [sRes, uRes, tRes, aRes, tkRes] = await Promise.all([
        apiClient.getAdminStats(),
        apiClient.getAdminUsers(),
        apiClient.getAdminTransactions(),
        apiClient.getAdminAuditLogs(),
        apiClient.getAdminTickets()
      ]);
      setStats(sRes);
      setUsers(uRes.users);
      setTransactions(tRes.transactions);
      setAuditLogs(aRes.auditLogs);
      setTickets(tkRes.tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const handleToggleStatus = async (targetId: string, currentStatus: string) => {
    const actionVerb = currentStatus === 'active' ? 'suspend' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionVerb} this user's financial account?`)) return;

    try {
      await apiClient.toggleUserStatus(targetId);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Operation failed');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await apiClient.resolveTicket(ticketId);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to resolve ticket');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-100 shadow-sm max-w-md mx-auto my-12">
        <Lock className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Restricted Administrator Area</h3>
        <p className="text-xs text-slate-500 mt-1">
          You do not have administrative privileges to view this portal.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch) ||
    u.accountNumber.includes(userSearch)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
              KudiFlow Central Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-account ledger oversight, fraud compliance, and dispute resolution.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Platform Statistics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-400 block mb-1">Total System Volume</span>
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {formatNaira(stats.totalVolume)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-400 block mb-1">Registered Users</span>
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.totalUsers} ({stats.activeUsers} active)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-400 block mb-1">Total Wallet Deposits</span>
            <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatNaira(stats.totalDeposits)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-400 block mb-1">Disputes & Open Inquiries</span>
            <span className="text-xl font-bold font-mono text-amber-600 tabular-nums">
              {stats.openTickets} pending
            </span>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>System Transactions ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'tickets' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Reported Issues ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="h-3.5 w-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Account Management</h3>
              <p className="text-[11px] text-slate-400">Zero PIN or password exposure per strict security invariants</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user, phone, NUBAN..."
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Contact</th>
                  <th className="py-2.5 px-3 font-semibold">NUBAN</th>
                  <th className="py-2.5 px-3 font-semibold">Balance</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-7 w-7 rounded-full object-cover bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.kudiTag}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.phone}</div>
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-slate-700">
                      {u.accountNumber}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 tabular-nums">
                      {formatNaira(u.balance)}
                    </td>

                    <td className="py-3 px-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'text-red-700 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: System Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Platform Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 font-medium">
                      {t.reference}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(t.date)}</td>
                    <td className="py-2.5 px-3 capitalize">{t.type.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 truncate max-w-[200px]">{t.description}</td>
                    <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                      {formatNaira(t.amount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Reported User Inquiries & Disputes</h3>
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No reported issues found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map(t => (
                <div key={t.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900">{t.subject}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.status === 'resolved' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{t.description}</p>
                    <p className="text-[10px] text-slate-400">
                      By {t.userName} ({t.userEmail}) · Ref: {t.id} · {formatDate(t.createdAt)}
                    </p>
                  </div>

                  {t.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveTicket(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold shrink-0"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Compliance & Security Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-3 font-semibold">Details</th>
                  <th className="py-2.5 px-3 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400">{formatDate(l.timestamp)}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-sans font-medium">{l.userName}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{l.action}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans truncate max-w-[280px]">{l.details}</td>
                    <td className="py-2.5 px-3 text-slate-400">{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
