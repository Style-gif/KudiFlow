import React, { useState } from 'react';
import { X, Plus, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { ExpenseCategory } from '../../types';
import { formatNaira } from '../../utils/format';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'income' | 'expense';
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

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'expense'
}) => {
  const { user, refreshUser } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [affectsBalance, setAffectsBalance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const num = Number(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (type === 'expense' && affectsBalance && (user?.balance || 0) < num) {
      setError(`Insufficient wallet balance (${formatNaira(user?.balance || 0)}) to deduct this expense.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.recordManualTransaction({
        type,
        amount: num,
        category: type === 'income' ? 'Income' : category,
        date,
        description,
        notes: notes.trim() || undefined,
        affectsBalance
      });
      await refreshUser();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          {type === 'expense' ? 'Record Expense' : 'Record Income'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">Track your cash inflows and outlays manually</p>

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              type === 'expense' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              type === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Income (+)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expense Category</label>
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
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={type === 'expense' ? 'e.g. Fuel, Lunch at Bukka, Market items' : 'e.g. Freelance gig, Cash gift, Consulting'}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Optional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Receipt / vendor name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={affectsBalance}
              onChange={e => setAffectsBalance(e.target.checked)}
              className="accent-emerald-600 h-4 w-4 rounded"
            />
            <span>
              {type === 'expense' ? 'Deduct from my active wallet balance' : 'Credit to my active wallet balance'}
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !amount || !description}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>{isSubmitting ? 'Recording...' : `Save ${type === 'expense' ? 'Expense' : 'Income'}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
