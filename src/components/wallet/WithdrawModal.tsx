import React, { useState } from 'react';
import { X, ArrowUpRight, Building2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { formatNaira, NIGERIAN_BANKS } from '../../utils/format';
import { PinModal } from '../common/PinModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { Transaction } from '../../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const handleAccountChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(clean);
    setAccountName('');

    if (clean.length === 10) {
      // Simulate NIBSS NIP Name Enquiry
      setIsResolving(true);
      setTimeout(() => {
        setIsResolving(false);
        setAccountName(`${user?.name.toUpperCase()} (VERIFIED)`);
      }, 600);
    }
  };

  const handleProceed = () => {
    setError('');
    const num = Number(amount);
    if (!accountNumber || accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit Nigerian NUBAN account number.');
      return;
    }
    if (!num || num < 100) {
      setError('Minimum withdrawal is ₦100.');
      return;
    }
    const totalRequired = num + 10;
    if ((user?.balance || 0) < totalRequired) {
      setError(`Insufficient balance. Total required: ${formatNaira(totalRequired)} (including ₦10 NIP transfer fee). Available: ${formatNaira(user?.balance || 0)}.`);
      return;
    }

    setIsPinOpen(true);
  };

  const handleAuthorizeWithdrawal = async (pin: string) => {
    const res = await apiClient.withdraw({
      bankName: selectedBank,
      accountNumber,
      accountName: accountName || `${user?.name}`,
      amount: Number(amount),
      pin
    });

    await refreshUser();
    onSuccess();
    setCompletedTx(res.transaction);
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
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Withdraw to Nigerian Bank</h3>
              <p className="text-xs text-slate-500">Fast NIP settlement to commercial banks</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-xs">
            <span className="text-slate-500">Available Wallet Balance</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums">{formatNaira(user?.balance || 0)}</span>
          </div>

          {/* Select Bank */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Destination Bank</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                {NIGERIAN_BANKS.map(b => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NUBAN Account Number */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              10-Digit NUBAN Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={e => handleAccountChange(e.target.value)}
              placeholder="e.g. 0123456789"
              maxLength={10}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            />
            {isResolving && (
              <span className="text-[11px] text-blue-600 font-medium block mt-1 animate-pulse">
                Querying NIBSS name directory...
              </span>
            )}
            {accountName && !isResolving && (
              <div className="mt-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold">
                Beneficiary: {accountName}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Withdrawal Amount (₦)</label>
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
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
              <span>Transfer Fee: <span className="font-mono text-slate-600">₦10.00 (NIP fee)</span></span>
              {amount && Number(amount) > 0 && (
                <span>Total Debit: <span className="font-bold text-slate-800 font-mono">{formatNaira(Number(amount) + 10)}</span></span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleProceed}
            disabled={!accountNumber || accountNumber.length !== 10 || !amount || Number(amount) <= 0}
            className="w-full h-11 rounded-xl bg-blue-700 text-white font-medium text-xs hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Confirm & Enter PIN</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSubmit={handleAuthorizeWithdrawal}
        title="Authorize Bank Withdrawal"
        subtitle={`Sending ${formatNaira(Number(amount))} to ${selectedBank}`}
        amount={Number(amount)}
        recipientName={`${selectedBank} (${accountNumber})`}
      />

      {completedTx && (
        <ReceiptModal
          transaction={completedTx}
          isOpen={true}
          onClose={() => {
            setCompletedTx(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
