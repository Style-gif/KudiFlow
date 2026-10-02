import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, ArrowDownLeft, ArrowUpRight, Lock, Calendar, Target, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { SavingsGoal } from '../../types';
import { formatNaira, formatShortDate } from '../../utils/format';
import { SavingsGoalModal } from './SavingsGoalModal';
import { PinModal } from '../common/PinModal';

export const SavingsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Quick Action Modal state (Deposit / Withdraw from goal)
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadSavings = async () => {
    try {
      const res = await apiClient.getSavings();
      setSavings(res.savings);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSavings();
  }, [user]);

  const handleOpenAction = (goal: SavingsGoal, type: 'deposit' | 'withdraw') => {
    setActiveGoal(goal);
    setActionType(type);
    setActionAmount('');
    setActionError('');
  };

  const handleProceedWithAction = () => {
    setActionError('');
    const num = Number(actionAmount);
    if (!num || num <= 0) {
      setActionError('Please enter a valid amount.');
      return;
    }

    if (actionType === 'deposit' && (user?.balance || 0) < num) {
      setActionError(`Insufficient wallet balance (${formatNaira(user?.balance || 0)}).`);
      return;
    }

    if (actionType === 'withdraw' && (activeGoal?.currentAmount || 0) < num) {
      setActionError(`Insufficient savings in this goal (${formatNaira(activeGoal?.currentAmount || 0)}).`);
      return;
    }

    setIsPinModalOpen(true);
  };

  const handleAuthorizeAction = async (pin: string) => {
    if (!activeGoal) return;
    const num = Number(actionAmount);

    if (actionType === 'deposit') {
      await apiClient.depositToGoal(activeGoal.id, num, pin);
    } else {
      await apiClient.withdrawFromGoal(activeGoal.id, num, pin);
    }

    await refreshUser();
    await loadSavings();
    setActiveGoal(null);
  };

  const totalSaved = savings.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalTarget = savings.reduce((acc, s) => acc + s.targetAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
            Savings Goals & Vaults
          </h1>
          <p className="text-xs text-slate-500">
            Discipline your Naira savings and earn interest while meeting life milestones.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs text-emerald-300 block mb-0.5">Total Amount Saved Across Goals</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight tabular-nums">
              {formatNaira(totalSaved)}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-300 block mb-0.5">Combined Milestone Target</span>
            <span className="text-lg font-bold font-mono text-emerald-200 tabular-nums">
              {formatNaira(totalTarget)}
            </span>
          </div>
        </div>

        <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-300">
          <span>{savings.length} Active Vaults</span>
          <span className="font-mono">
            {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}% Complete
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savings.map(g => (
          <div
            key={g.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  {g.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Target: {formatShortDate(g.targetDate)}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 truncate">{g.name}</h3>

              <div className="flex justify-between items-baseline mb-2">
                <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                  {formatNaira(g.currentAmount)}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  of {formatNaira(g.targetAmount)}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 mb-4">
                <span>Progress</span>
                <span className="font-bold text-slate-800 font-mono">
                  {g.progressPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Quick Actions: Deposit or Withdraw */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleOpenAction(g, 'deposit')}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>Deposit</span>
              </button>

              <button
                onClick={() => handleOpenAction(g, 'withdraw')}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <ArrowUpRight className="h-3 w-3" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Goal Deposit / Withdraw Modal */}
      {activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setActiveGoal(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {actionType === 'deposit' ? 'Add Funds to Goal' : 'Withdraw from Goal'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 truncate">{activeGoal.name}</p>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Amount (₦)</span>
                <span>
                  {actionType === 'deposit'
                    ? `Wallet: ${formatNaira(user?.balance || 0)}`
                    : `Saved: ${formatNaira(activeGoal.currentAmount)}`}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
                <input
                  type="number"
                  value={actionAmount}
                  onChange={e => setActionAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {actionError && (
              <p className="text-xs text-red-600 mb-3">{actionError}</p>
            )}

            <button
              onClick={handleProceedWithAction}
              className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 transition-colors"
            >
              Confirm with PIN
            </button>
          </div>
        </div>
      )}

      {/* Transaction PIN Verification Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSubmit={handleAuthorizeAction}
        title={actionType === 'deposit' ? 'Confirm Savings Deposit' : 'Confirm Savings Withdrawal'}
        subtitle={`${actionType === 'deposit' ? 'Funding' : 'Returning'} ${formatNaira(Number(actionAmount) || 0)} to/from "${activeGoal?.name}"`}
        amount={Number(actionAmount) || 0}
      />

      <SavingsGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadSavings}
      />
    </div>
  );
};
