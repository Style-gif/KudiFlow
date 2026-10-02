import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  PlusCircle,
  Zap,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  ArrowDownLeft,
  Receipt,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { WalletSummary, Transaction, Budget, SavingsGoal } from '../../types';
import { formatNaira, formatDate } from '../../utils/format';
import { ReceiptModal } from '../common/ReceiptModal';

interface DashboardViewProps {
  onOpenSend: () => void;
  onOpenAddMoney: () => void;
  onOpenPayBills: () => void;
  onOpenRecordExpense: () => void;
  onOpenNewGoal: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenSend,
  onOpenAddMoney,
  onOpenPayBills,
  onOpenRecordExpense,
  onOpenNewGoal,
  onNavigate
}) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [sumRes, txRes, bRes, sRes] = await Promise.all([
        apiClient.getWalletSummary(),
        apiClient.getTransactions(),
        apiClient.getBudgets(),
        apiClient.getSavings()
      ]);
      setSummary(sumRes);
      setRecentTx(txRes.transactions.slice(0, 5));
      setBudgets(bRes.budgets);
      setSavings(sRes.savings);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const activeWarnings = budgets.filter(b => b.isExceeded || b.isNearLimit);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500">
            Here's a live overview of your Naira finances today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRecordExpense}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Record Cash</span>
          </button>
        </div>
      </div>

      {/* Budget Warning Banner if near or exceeded */}
      {activeWarnings.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-xs">
            <h4 className="font-bold text-amber-900">
              Budget Spending Attention Needed ({activeWarnings.length})
            </h4>
            <p className="text-amber-800 mt-0.5">
              {activeWarnings[0].isExceeded
                ? `You have exceeded your ${activeWarnings[0].category} budget limit by ${formatNaira(activeWarnings[0].spent - activeWarnings[0].limit)}!`
                : `You are nearing your ${activeWarnings[0].category} budget limit (${activeWarnings[0].percentage.toFixed(0)}% used).`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('budgets')}
            className="text-xs font-semibold text-amber-900 underline shrink-0 hover:text-amber-950"
          >
            View Budgets
          </button>
        </div>
      )}

      {/* Main Hero Wallet Card & Totals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Available Balance Hero */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 shadow-xl shadow-emerald-950/10 border border-emerald-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-300">Total Available Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-white transition-colors"
                title={showBalance ? 'Hide Balance' : 'Show Balance'}
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Providus: {user?.accountNumber || '9012345678'}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-6 tabular-nums">
            {showBalance ? formatNaira(summary?.balance || user?.balance || 0) : '₦ ••••••••'}
          </div>

          {/* Quick Action Buttons within Hero */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
            <button
              onClick={onOpenSend}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/30 flex items-center justify-center mb-1 text-emerald-300">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">Send</span>
            </button>

            <button
              onClick={onOpenAddMoney}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/30 flex items-center justify-center mb-1 text-emerald-300">
                <PlusCircle className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">Add Money</span>
            </button>

            <button
              onClick={onOpenPayBills}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/30 flex items-center justify-center mb-1 text-emerald-300">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">Pay Bills</span>
            </button>

            <button
              onClick={onOpenNewGoal}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/30 flex items-center justify-center mb-1 text-emerald-300">
                <PiggyBank className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">Save</span>
            </button>
          </div>
        </div>

        {/* Financial Health Summary Column */}
        <div className="space-y-3">
          {/* Total Savings Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Total Locked Savings</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {showBalance ? formatNaira(summary?.totalSavings || 0) : '₦ ••••••'}
              </span>
              <span className="text-[11px] text-emerald-600 block mt-0.5">
                {savings.length} active target goals
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>

          {/* Income vs Expenses Mini Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span>Total Inflow</span>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-700 tabular-nums truncate">
                {showBalance ? formatNaira(summary?.totalIncome || 0, false) : '••••'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                <span>Total Outflow</span>
              </div>
              <div className="text-sm font-bold font-mono text-rose-700 tabular-nums truncate">
                {showBalance ? formatNaira(summary?.totalExpenses || 0, false) : '••••'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Budget Progress & Savings Goals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress Widget */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Budget Progress</h3>
              <p className="text-[11px] text-slate-400">Current calendar month spending</p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-slate-500 mb-2">No category budgets created yet.</p>
              <button
                onClick={() => onNavigate('budgets')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700"
              >
                Set a Budget
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {budgets.slice(0, 3).map(b => (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-slate-800">{b.category}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      <span className="font-bold text-slate-900">{formatNaira(b.spent)}</span> of {formatNaira(b.limit)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.isExceeded
                          ? 'bg-red-500'
                          : b.isNearLimit
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Savings Vault Goals</h3>
              <p className="text-[11px] text-slate-400">Target funds for major milestones</p>
            </div>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {savings.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-slate-500 mb-2">No active savings goals found.</p>
              <button
                onClick={onOpenNewGoal}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg"
              >
                Create First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {savings.slice(0, 3).map(g => (
                <div key={g.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{g.name}</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {g.progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Saved: {formatNaira(g.currentAmount)}</span>
                    <span>Target: {formatNaira(g.targetAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Financial Activity</h3>
            <p className="text-[11px] text-slate-400">Click any transaction to inspect official receipt</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>Full History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTx.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No recent transactions recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTx.map(t => {
              const isCredit =
                t.type === 'deposit' ||
                t.type === 'transfer_in' ||
                t.type === 'income' ||
                t.type === 'savings_withdrawal';

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className="w-full text-left py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {t.description}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {t.counterparty} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-bold font-mono tabular-nums ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatNaira(t.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.reference.slice(-8)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      <ReceiptModal
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
