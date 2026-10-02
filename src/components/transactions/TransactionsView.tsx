import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Transaction } from '../../types';
import { formatNaira, formatDate } from '../../utils/format';
import { ReceiptModal } from '../common/ReceiptModal';

export const TransactionsView: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTx = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getTransactions({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        type: type !== 'All' ? type : undefined,
        status: status !== 'All' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setTransactions(res.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTx();
  }, [user, category, type, status, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTx();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setType('All');
    setStatus('All');
    setStartDate('');
    setEndDate('');
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Reference,Date,Type,Category,Description,Counterparty,Amount (NGN),Status\n'];
    const rows = transactions.map(t =>
      `"${t.reference}","${t.date}","${t.type}","${t.category}","${t.description.replace(/"/g, '""')}","${t.counterparty.replace(/"/g, '""')}","${t.amount}","${t.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kudiflow_statement_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
            Transaction Activity Statement
          </h1>
          <p className="text-xs text-slate-500">
            Search, filter, and inspect verified receipts for all Naira transfers and bills.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={transactions.length === 0}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by description, counterparty, or reference (e.g. KDF-2026...)"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Income">Income</option>
              <option value="Savings">Savings</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden bg-white"
            >
              <option value="All">All Types</option>
              <option value="deposit">Deposit (Inflow)</option>
              <option value="transfer_in">Received Transfer</option>
              <option value="transfer_out">Sent Transfer</option>
              <option value="bill_payment">Bill Payment</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="expense">Cash Expense</option>
              <option value="income">Cash Income</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {(category !== 'All' || type !== 'All' || search || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map(t => {
              const isCredit =
                t.type === 'deposit' ||
                t.type === 'transfer_in' ||
                t.type === 'income' ||
                t.type === 'savings_withdrawal';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className="py-3.5 px-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {t.description}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono capitalize">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {t.counterparty} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold font-mono tabular-nums ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatNaira(t.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {t.reference}
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
