import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { AnalyticsData, WalletSummary } from '../../types';
import { formatNaira } from '../../utils/format';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          apiClient.getAnalytics(),
          apiClient.getWalletSummary()
        ]);
        setData(aRes);
        setSummary(sRes);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (!data || !summary) {
    return <div className="text-center py-12 text-xs text-slate-400">Loading analytics insights...</div>;
  }

  const categoryEntries = Object.entries(data.categoryBreakdown)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalCategorySpending = categoryEntries.reduce((acc, curr) => acc + curr[1], 0);

  // Maximum value for trends chart scaling
  const maxTrendVal = Math.max(
    ...data.monthlyTrends.map(t => Math.max(t.income, t.expenses)),
    100000
  );

  const categoryColors: Record<string, string> = {
    Food: '#059669',
    Transportation: '#0284c7',
    Bills: '#e11d48',
    Shopping: '#d97706',
    Entertainment: '#7c3aed',
    Education: '#0d9488',
    Healthcare: '#ea580c',
    Other: '#64748b'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
          Financial Reports & Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Clear visual breakdown of your cash velocity, category burn rates, and savings health.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Net Financial Flow</span>
            <span className="font-mono text-emerald-600 font-bold">
              {summary.totalIncome - summary.totalExpenses >= 0 ? '+Surplus' : '-Deficit'}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatNaira(summary.totalIncome - summary.totalExpenses)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Savings Rate</span>
            <span className="font-mono text-emerald-600 font-bold">
              {summary.totalIncome > 0
                ? ((summary.totalSavings / summary.totalIncome) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatNaira(summary.totalSavings)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg. Monthly Spend</span>
            <span className="font-mono text-slate-500">Last 6 mo</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatNaira(
              data.monthlyTrends.reduce((acc, t) => acc + t.expenses, 0) / (data.monthlyTrends.length || 1)
            )}
          </div>
        </div>
      </div>

      {/* Monthly Inflows vs Outflows Trends Chart */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Cash Inflow vs Outflow</h3>
            <p className="text-[11px] text-slate-400">Comparing income deposits and expenses over 6 months</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-600" />
              <span className="text-slate-600 font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-500" />
              <span className="text-slate-600 font-medium">Expenses</span>
            </div>
          </div>
        </div>

        {/* Clean SVG Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 pb-2">
          {data.monthlyTrends.map((t, idx) => {
            const incHeight = maxTrendVal > 0 ? (t.income / maxTrendVal) * 100 : 0;
            const expHeight = maxTrendVal > 0 ? (t.expenses / maxTrendVal) * 100 : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-48">
                  {/* Income bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-emerald-600 rounded-t-md transition-all duration-300 group-hover:bg-emerald-500 relative"
                    style={{ height: `${Math.max(4, incHeight)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 font-mono pointer-events-none transition-opacity">
                      +{formatNaira(t.income, false)}
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-rose-500 rounded-t-md transition-all duration-300 group-hover:bg-rose-400 relative"
                    style={{ height: `${Math.max(4, expHeight)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 font-mono pointer-events-none transition-opacity">
                      -{formatNaira(t.expenses, false)}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 font-medium mt-2 block truncate">
                  {t.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending by Category Breakdown */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="mb-5">
          <h3 className="text-sm font-bold text-slate-900">Spending by Category</h3>
          <p className="text-[11px] text-slate-400">Total outlays by expense bucket</p>
        </div>

        {categoryEntries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No expenses recorded yet to generate breakdown.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Horizontal Stacked Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
              {categoryEntries.map(([cat, amt]) => {
                const pct = (amt / totalCategorySpending) * 100;
                return (
                  <div
                    key={cat}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: categoryColors[cat] || '#64748b'
                    }}
                    title={`${cat}: ${formatNaira(amt)} (${pct.toFixed(1)}%)`}
                    className="h-full transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </div>

            {/* List breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {categoryEntries.map(([cat, amt]) => {
                const pct = (amt / totalCategorySpending) * 100;
                const col = categoryColors[cat] || '#64748b';
                return (
                  <div
                    key={cat}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: col }} />
                      <span className="font-semibold text-slate-800 truncate">{cat}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatNaira(amt)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono ml-2">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
