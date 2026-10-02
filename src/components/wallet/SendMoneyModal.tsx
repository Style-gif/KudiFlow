import React, { useState } from 'react';
import { X, Send, Search, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { formatNaira } from '../../utils/format';
import { PinModal } from '../common/PinModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { Transaction } from '../../types';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [recipientQuery, setRecipientQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [recipient, setRecipient] = useState<{ id: string; name: string; kudiTag: string; accountNumber: string; bankName: string; avatar: string } | null>(null);
  const [resolveError, setResolveError] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (queryValue?: string) => {
    const val = queryValue !== undefined ? queryValue : recipientQuery;
    if (!val.trim()) return;

    setIsResolving(true);
    setResolveError('');
    setRecipient(null);

    try {
      const res = await apiClient.resolveRecipient(val.trim());
      setRecipient(res);
    } catch (err: any) {
      setResolveError(err.message || 'No user found with those details');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSelectRecent = (tag: string) => {
    setRecipientQuery(tag);
    handleLookup(tag);
  };

  const handleProceed = () => {
    setError('');
    const numAmount = Number(amount);
    if (!recipient) {
      setError('Please resolve and confirm a recipient.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }
    if (numAmount < 50) {
      setError('Minimum transfer is ₦50.');
      return;
    }
    if ((user?.balance || 0) < numAmount) {
      setError(`Insufficient balance. Your balance is ${formatNaira(user?.balance || 0)}.`);
      return;
    }

    setIsPinOpen(true);
  };

  const handleAuthorizeTransfer = async (pin: string) => {
    if (!recipient) return;
    const res = await apiClient.transfer({
      recipientId: recipient.id,
      amount: Number(amount),
      pin,
      note: note.trim() || undefined
    });

    await refreshUser();
    onSuccess();
    setCompletedTx(res.transaction);
  };

  const quickRecipients = [
    { name: 'Babatunde Adeleke', tag: '@tunde' },
    { name: 'Adaeze Okafor', tag: '@adaeze' },
    { name: 'Oluwaseun Balogun', tag: '@seun_admin' }
  ].filter(r => r.tag !== user?.kudiTag);

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
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Send Money (Instant P2P)</h3>
              <p className="text-xs text-slate-500">Zero transfer fee to any KudiFlow account</p>
            </div>
          </div>

          {/* Balance pill */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-xs">
            <span className="text-slate-500">Available Wallet Balance</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums">{formatNaira(user?.balance || 0)}</span>
          </div>

          {/* Quick Select Beneficiaries */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Beneficiaries
            </span>
            <div className="flex gap-2">
              {quickRecipients.map(r => (
                <button
                  key={r.tag}
                  type="button"
                  onClick={() => handleSelectRecent(r.tag)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:text-emerald-700 transition-colors text-slate-700 font-medium truncate"
                >
                  {r.name.split(' ')[0]} ({r.tag})
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Lookup Field */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recipient KudiTag, Phone, or Email
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={recipientQuery}
                onChange={e => {
                  setRecipientQuery(e.target.value);
                  setRecipient(null);
                  setResolveError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="e.g. @tunde or 07051239874"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden pr-20"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={isResolving || !recipientQuery.trim()}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {isResolving ? (
                  <span className="animate-spin text-[10px]">···</span>
                ) : (
                  <>
                    <Search className="h-3 w-3" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>
            {resolveError && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {resolveError}
              </p>
            )}
          </div>

          {/* Verified Beneficiary Card */}
          {recipient && (
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 mb-4 flex items-center gap-3">
              <img
                src={recipient.avatar}
                alt={recipient.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20 bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">{recipient.name}</span>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {recipient.kudiTag} · {recipient.accountNumber} ({recipient.bankName.split('/')[0].trim()})
                </div>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transfer Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="50"
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[1000, 5000, 10000, 20000].map(quickVal => (
                <button
                  key={quickVal}
                  type="button"
                  onClick={() => setAmount(quickVal.toString())}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono"
                >
                  +{quickVal.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Narration */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Narration / Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Lunch money, Lekki toll, Freelance gig"
              maxLength={60}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={!recipient || !amount || Number(amount) <= 0}
            className="w-full h-11 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200"
          >
            <span>Confirm & Enter PIN</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transaction PIN Verification Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSubmit={handleAuthorizeTransfer}
        title="Confirm Transfer"
        subtitle={`Sending ${formatNaira(Number(amount))} to ${recipient?.name}`}
        amount={Number(amount)}
        recipientName={recipient?.name}
      />

      {/* Receipt Modal on completion */}
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
