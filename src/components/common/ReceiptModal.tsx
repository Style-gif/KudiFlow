import React from 'react';
import { X, CheckCircle, Download, Share2, Copy, Check } from 'lucide-react';
import { Transaction } from '../../types';
import { formatNaira, formatDate } from '../../utils/format';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  if (!isOpen || !transaction) return null;

  const isPositive =
    transaction.type === 'deposit' ||
    transaction.type === 'transfer_in' ||
    transaction.type === 'income' ||
    transaction.type === 'savings_withdrawal';

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
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

        {/* Bank & App Watermark Header */}
        <div className="text-center border-b border-dashed border-slate-200 pb-5 mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm tracking-wider">
              KD
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 font-display">KudiFlow Pay</span>
          </div>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">Official Transaction Receipt</p>

          <div className="mt-4 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
              Transaction Successful
            </span>
            <div className={`mt-3 text-3xl font-bold font-mono tabular-nums ${isPositive ? 'text-emerald-700' : 'text-slate-900'}`}>
              {isPositive ? '+' : '-'}{formatNaira(transaction.amount)}
            </div>
          </div>
        </div>

        {/* Transaction Detail Lines */}
        <div className="space-y-3 text-xs mb-6">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Transaction Reference</span>
            <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium">
              <span>{transaction.reference}</span>
              <button
                onClick={handleCopyRef}
                className="text-slate-400 hover:text-emerald-600 transition-colors"
                title="Copy Reference"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Date & Time</span>
            <span className="text-slate-800 font-medium">{formatDate(transaction.date)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Transaction Type</span>
            <span className="text-slate-800 font-medium capitalize">
              {transaction.type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Category</span>
            <span className="text-slate-800 font-medium">{transaction.category}</span>
          </div>

          <div className="flex justify-between items-start py-1 border-b border-slate-100">
            <span className="text-slate-500">Counterparty</span>
            <span className="text-slate-800 font-medium text-right max-w-[220px]">
              {transaction.counterparty}
            </span>
          </div>

          <div className="flex justify-between items-start py-1 border-b border-slate-100">
            <span className="text-slate-500">Description</span>
            <span className="text-slate-800 font-medium text-right max-w-[220px]">
              {transaction.description}
            </span>
          </div>

          {/* Electricity Prepaid Token Display */}
          {transaction.metadata?.tokenCode && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center my-3">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Electricity Meter Recharge Token
              </span>
              <span className="text-lg font-mono font-bold text-amber-950 tracking-wider block my-1 selection:bg-amber-300">
                {transaction.metadata.tokenCode}
              </span>
              <span className="text-xs text-amber-800">
                Units: <span className="font-semibold">{transaction.metadata.units || 'Standard Tariff'}</span>
                {transaction.metadata.meterNumber && ` · Meter: ${transaction.metadata.meterNumber}`}
              </span>
            </div>
          )}

          {transaction.metadata?.fee !== undefined && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">NIP Transfer Fee</span>
              <span className="text-slate-800 font-medium tabular-nums">{formatNaira(transaction.metadata.fee)}</span>
            </div>
          )}

          {transaction.notes && (
            <div className="flex justify-between items-start py-1 border-b border-slate-100">
              <span className="text-slate-500">Note</span>
              <span className="text-slate-700 italic text-right max-w-[220px]">"{transaction.notes}"</span>
            </div>
          )}
        </div>

        {/* Regulatory & Security Footer */}
        <div className="rounded-lg bg-slate-50 p-2.5 text-center text-[10px] text-slate-400 mb-5">
          Licensed by Central Bank of Nigeria (CBN) and insured by NDIC through partner settlement banks.
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{downloadSuccess ? 'Receipt Saved!' : 'Download PDF'}</span>
          </button>
          <button
            onClick={handleCopyRef}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
