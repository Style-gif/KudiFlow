import React, { useState } from 'react';
import { X, Target, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { ExpenseCategory } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Bills',
  'Shopping',
  'Entertainment',
  'Education',
  'Healthcare',
  'Other'
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [limit, setLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numLimit = Number(limit);
    if (!numLimit || numLimit <= 0) {
      setError('Please enter a valid budget limit.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createBudget({
        category,
        limit: numLimit,
        period: 'monthly',
        alertThreshold: Number(alertThreshold) || 80
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Set Category Budget</h3>
            <p className="text-xs text-slate-500">Keep spending in check and get early warnings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monthly Limit (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
              <input
                type="number"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                placeholder="50,000"
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[30000, 50000, 80000, 150000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLimit(val.toString())}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono"
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Early Warning Alert Threshold</label>
              <span className="text-xs font-mono font-bold text-emerald-700">{alertThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={e => setAlertThreshold(e.target.value)}
              className="w-full accent-emerald-600"
            />
            <span className="text-[11px] text-slate-400 block mt-0.5">
              You will receive an in-app notification when spending reaches {alertThreshold}% of this budget.
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !limit}
            className="w-full h-11 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-sm shadow-emerald-200"
          >
            <span>{isSubmitting ? 'Saving...' : 'Set Budget Limit'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
