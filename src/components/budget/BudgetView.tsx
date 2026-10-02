import React, { useState, useEffect } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Budget } from '../../types';
import { formatNaira } from '../../utils/format';
import { BudgetModal } from './BudgetModal';

export const BudgetView: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = async () => {
    try {
      const res = await apiClient.getBudgets();
      setBudgets(res.budgets);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget limit?')) {
      await apiClient.deleteBudget(id);
      await loadBudgets();
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
            Monthly Spending Budgets
          </h1>
          <p className="text-xs text-slate-500">
            Set category limits, monitor real-time utilization, and prevent overspending.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Budget Category</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Total Monthly Budget Cap</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {formatNaira(totalBudgeted)}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block mb-0.5">Total Spent So Far</span>
            <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
              {formatNaira(totalSpent)} ({overallPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercentage >= 100
                ? 'bg-red-500'
                : overallPercentage >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span>{budgets.length} active budget categories</span>
          <span className="font-mono">Remaining: {formatNaira(Math.max(0, totalBudgeted - totalSpent))}</span>
        </div>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(b => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.category}</h3>
                  <span className="text-[11px] text-slate-400">Monthly renewal</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {b.isExceeded ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
                      Exceeded
                    </span>
                  ) : b.isNearLimit ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                      Near Limit
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      On Track
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 transition-colors"
                    title="Remove budget"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
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

              <div className="flex justify-between items-baseline text-xs mb-3 font-mono">
                <span className="text-slate-500">
                  Spent: <span className="font-bold text-slate-900">{formatNaira(b.spent)}</span>
                </span>
                <span className="text-slate-500">
                  Cap: <span className="font-bold text-slate-900">{formatNaira(b.limit)}</span>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
              <span>Warning threshold: {b.alertThreshold}%</span>
              <span className="font-semibold text-slate-700">
                {b.isExceeded ? 'Over by ' + formatNaira(b.spent - b.limit) : 'Left: ' + formatNaira(b.remaining)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadBudgets}
      />
    </div>
  );
};
