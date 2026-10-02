import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  PlusCircle,
  Copy,
  Check,
  QrCode,
  Building2,
  ArrowDownLeft,
  Share2,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Transaction } from '../../types';
import { formatNaira, formatDate } from '../../utils/format';
import { ReceiptModal } from '../common/ReceiptModal';

interface WalletViewProps {
  onOpenSend: () => void;
  onOpenAddMoney: () => void;
  onOpenWithdraw: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  onOpenSend,
  onOpenAddMoney,
  onOpenWithdraw
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');

  const loadTx = async () => {
    try {
      const res = await apiClient.getTransactions();
      setTransactions(res.transactions);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTx();
  }, [user]);

  const handleCopyAccount = () => {
    if (user?.accountNumber) {
      navigator.clipboard.writeText(user.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredTx = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.counterparty.toLowerCase().includes(search.toLowerCase()) ||
    t.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Wallet Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
            Naira Wallet & Accounts
          </h1>
          <p className="text-xs text-slate-500">
            Manage your dedicated virtual accounts, bank transfers, and fund outlays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddMoney}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Fund Wallet</span>
          </button>
          <button
            onClick={onOpenWithdraw}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Building2 className="h-4 w-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Main Account Card with Nigerian Virtual Account details */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 shadow-xl border border-emerald-900/30">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
              Active Naira Settlement Account
            </span>
            <h2 className="text-3xl sm:text-4xl font-mono font-bold tabular-nums">
              {formatNaira(user?.balance || 0)}
            </h2>
          </div>

          <button
            onClick={() => setShowQr(!showQr)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 transition-colors"
            title="Show QR Code for receiving money"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>

        {/* Account Details Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white/10 rounded-2xl border border-white/10 text-xs mb-5">
          <div>
            <span className="text-slate-400 block text-[10px]">Settlement Bank</span>
            <span className="font-semibold text-white">{user?.bankName || 'Providus Bank / KudiFlow'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Virtual NUBAN</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-sm">{user?.accountNumber || '9012345678'}</span>
              <button
                onClick={handleCopyAccount}
                className="text-emerald-300 hover:text-white transition-colors"
                title="Copy NUBAN"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Beneficiary / Tag</span>
            <span className="font-semibold text-white truncate block">{user?.name} ({user?.kudiTag})</span>
          </div>
        </div>

        {/* QR Code toggle overlay */}
        {showQr && (
          <div className="mb-5 p-4 bg-white text-slate-900 rounded-2xl text-center flex flex-col items-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
              {/* Responsive SVG QR Code representation */}
              <div className="h-32 w-32 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-mono p-2">
                QR CODE: {user?.kudiTag}
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-900">Scan to send money to {user?.kudiTag}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user?.accountNumber} · Providus Bank</p>
          </div>
        )}

        {/* Action Row */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <button
            onClick={onOpenSend}
            className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Send Money</span>
          </button>

          <button
            onClick={onOpenAddMoney}
            className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Funds</span>
          </button>

          <button
            onClick={onOpenWithdraw}
            className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Building2 className="h-4 w-4" />
            <span>Withdraw to Bank</span>
          </button>
        </div>
      </div>

      {/* Wallet Ledger & Transaction Log */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Wallet Ledger Transactions</h3>
            <p className="text-[11px] text-slate-400">All direct debits and inflows to your primary wallet</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter wallet activities..."
              className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {filteredTx.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No wallet transactions matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTx.map(t => {
              const isCredit =
                t.type === 'deposit' ||
                t.type === 'transfer_in' ||
                t.type === 'income' ||
                t.type === 'savings_withdrawal';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className="py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
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
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {t.description}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                          {t.status}
                        </span>
                      </div>
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
                      Ref: {t.reference.slice(-8)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ReceiptModal
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
