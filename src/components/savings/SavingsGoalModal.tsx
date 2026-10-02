import React, { useState } from 'react';
import { X, PiggyBank, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { formatNaira } from '../../utils/format';
import { PinModal } from '../common/PinModal';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-01-31');
  const [category, setCategory] = useState('Rent & Housing');
  const [initialDeposit, setInitialDeposit] = useState('0');
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProceed = () => {
    setError('');
    const targetNum = Number(targetAmount);
    const depositNum = Number(initialDeposit) || 0;

    if (!name.trim()) {
      setError('Please enter a goal name.');
      return;
    }
    if (!targetNum || targetNum <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }
    if (!targetDate) {
      setError('Please select a target date.');
      return;
    }
    if (depositNum > 0 && (user?.balance || 0) < depositNum) {
      setError(`Insufficient wallet balance (${formatNaira(user?.balance || 0)}) for initial deposit.`);
      return;
    }

    if (depositNum > 0) {
      setIsPinOpen(true);
    } else {
      createGoalWithoutInitial();
    }
  };

  const createGoalWithoutInitial = async () => {
    try {
      await apiClient.createSavingsGoal({
        name,
        targetAmount: Number(targetAmount),
        targetDate,
        category,
        initialDeposit: 0
      });
      await refreshUser();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    }
  };

  const handleAuthorizeWithPin = async (pin: string) => {
    await apiClient.createSavingsGoal({
      name,
      targetAmount: Number(targetAmount),
      targetDate,
      category,
      initialDeposit: Number(initialDeposit),
      pin
    });
    await refreshUser();
    onSuccess();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Savings Goal</h3>
              <p className="text-xs text-slate-500">Lock away funds towards a target with KudiFlow Vault</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Goal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Lekki House Rent, Ember Month Fund, Solar Inverter"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="1,500,000"
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="Rent & Housing">Rent & Housing</option>
                <option value="Gadgets & Tech">Gadgets & Tech</option>
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Travel & Vacation">Travel & Vacation</option>
                <option value="Education & Fees">Education & Fees</option>
                <option value="Business Capital">Business Capital</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Initial Deposit from Wallet (Optional)</label>
                <span className="text-[11px] text-slate-500">
                  Wallet: <span className="font-mono font-bold text-slate-800">{formatNaira(user?.balance || 0)}</span>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
                <input
                  type="number"
                  value={initialDeposit}
                  onChange={e => setInitialDeposit(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className="w-full h-11 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{Number(initialDeposit) > 0 ? 'Authorize Deposit & Create Goal' : 'Create Savings Goal'}</span>
            </button>
          </div>
        </div>
      </div>

      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSubmit={handleAuthorizeWithPin}
        title="Authorize Goal Funding"
        subtitle={`Funding ${name} with ${formatNaira(Number(initialDeposit))}`}
        amount={Number(initialDeposit)}
        recipientName={`Vault Goal: ${name}`}
      />
    </>
  );
};
