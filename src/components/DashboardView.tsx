import React from 'react';
import {
  Wallet,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  PlusCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  PieChart,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Transaction,
  BudgetAllocation,
  InvestmentAsset,
  UserFinancialProfile,
  Language,
  BudgetCategory,
} from '../types/finance';
import { translations } from '../utils/i18n';
import {
  calculateCategoryActuals,
  calculateFinancialSummary,
  calculatePortfolioSummary,
  formatCurrency,
} from '../utils/accounting';
import { ConfirmModal } from './ConfirmModal';

interface DashboardViewProps {
  profile: UserFinancialProfile;
  budget: BudgetAllocation[];
  transactions: Transaction[];
  investments: InvestmentAsset[];
  lang: Language;
  currencyView: 'USD' | 'KHR';
  onOpenNewTx: () => void;
  onRecordPayday: (paydayNumber: 1 | 2) => void;
  onNavigateToTab: (tab: string) => void;
  onEditTx?: (tx: Transaction) => void;
  onDeleteTx?: (txId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  budget,
  transactions,
  investments,
  lang,
  currencyView,
  onOpenNewTx,
  onRecordPayday,
  onNavigateToTab,
  onEditTx,
  onDeleteTx,
}) => {
  const t = translations[lang];
  const [deletingTx, setDeletingTx] = React.useState<Transaction | null>(null);
  const summary = calculateFinancialSummary(transactions, profile.openingCashBalance);
  const invSummary = calculatePortfolioSummary(investments);
  const actuals = calculateCategoryActuals(transactions);

  const totalBudgetPlanned = budget.reduce((sum, b) => sum + b.plannedAmount, 0);
  const livingExpenseCategories: BudgetCategory[] = [
    'food',
    'transport',
    'bills',
    'entertainment',
    'flexible_buffer',
    'shopping',
    'health',
    'education',
    'family',
    'other',
  ];

  const remainingBudget =
    totalBudgetPlanned -
    (summary.totalExpenses +
      summary.totalSavingsTransfers +
      summary.totalEmergencyTransfers +
      summary.totalInvestContributions);

  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const isCycle1 = currentDay <= 15;
  const cycleDaysTotal = isCycle1 ? 15 : daysInMonth - 15;
  const cycleDaysPassed = isCycle1 ? currentDay : currentDay - 15;
  const cycleDaysLeft = isCycle1
    ? Math.max(1, 16 - currentDay)
    : Math.max(1, daysInMonth - currentDay + 1);

  // Living expense remaining budget:
  const livingBudget = totalBudgetPlanned - 60 - 50 - 10;
  const livingRemaining = Math.max(0, livingBudget - summary.totalExpenses);
  const safeDailyAllowance = Number((livingRemaining / cycleDaysLeft).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Welcome & Payday Action Ribbon */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-white to-blue-50/40 p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {t.dashboard.title}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t.dashboard.subtitle} • {t.dashboard.monthlySalary}:{' '}
              <strong className="text-blue-700">
                {formatCurrency(profile.monthlySalary, currencyView)}
              </strong>{' '}
              ({formatCurrency(profile.payday1Amount, currencyView)} × 2)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onRecordPayday(1)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 transition"
              title="Deposit Payday 1 into transaction tracker"
            >
              <CalendarCheck className="h-4 w-4 text-blue-600" />
              <span>{t.payday.recordPayday1}</span>
            </button>
            <button
              onClick={() => onRecordPayday(2)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 transition"
              title="Deposit Payday 2 into transaction tracker"
            >
              <CalendarCheck className="h-4 w-4 text-blue-600" />
              <span>{t.payday.recordPayday2}</span>
            </button>
            <button
              onClick={onOpenNewTx}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t.dashboard.quickAddTransaction}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payday Cycle & Daily Spending Allowance Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isCycle1 ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100'
              }`}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {lang === 'km' ? 'វដ្តបើកប្រាក់ខែបច្ចុប្បន្ន' : 'Active Payday Cycle'}:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isCycle1
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                  }`}
                >
                  {isCycle1
                    ? lang === 'km'
                      ? 'លើកទី១ (ថ្ងៃ ១ ដល់ ១៥)'
                      : 'Payday 1 (1 to 15)'
                    : lang === 'km'
                    ? 'លើកទី២ (ថ្ងៃ ១៥ ដល់ ១)'
                    : 'Payday 2 (15 to 1)'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {lang === 'km'
                  ? `ថ្ងៃទី ${currentDay} • នៅសល់ ${cycleDaysLeft} ថ្ងៃទៀត`
                  : `Day ${currentDay} • ${cycleDaysLeft} days remaining`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 self-start sm:self-center">
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                {lang === 'km' ? 'កម្រិតចំណាយសុវត្ថិភាព / ថ្ងៃ' : 'Safe Daily Spending'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black font-mono text-blue-700">
                  {formatCurrency(safeDailyAllowance, currencyView)}
                </span>
                <span className="text-xs text-slate-500">/ {lang === 'km' ? 'ថ្ងៃ' : 'day'}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                {lang === 'km' ? 'ថវិកាចំណាយនៅសល់' : 'Living Budget Left'}
              </span>
              <span className="text-sm font-bold font-mono text-slate-800 mt-0.5 block">
                {formatCurrency(livingRemaining, currencyView)}
              </span>
            </div>
          </div>
        </div>

        {/* Cycle Progress bar */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>{isCycle1 ? 'Day 1' : 'Day 15'}</span>
            <span className="font-semibold text-slate-700">
              {Math.round((cycleDaysPassed / cycleDaysTotal) * 100)}% cycle elapsed
            </span>
            <span>{isCycle1 ? 'Day 15' : 'Day 1 (End)'}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCycle1 ? 'bg-blue-600' : 'bg-indigo-600'
              }`}
              style={{
                width: `${Math.min(100, Math.round((cycleDaysPassed / cycleDaysTotal) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Current Cash Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.dashboard.currentCashBalance}
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(summary.currentCashBalance, currencyView)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {t.dashboard.openingBalance}: {formatCurrency(profile.openingCashBalance, currencyView)} | Flow:{' '}
            <span className={summary.netCashMovement >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {formatCurrency(summary.netCashMovement, currencyView, true)}
            </span>
          </p>
        </div>

        {/* Card 2: Living Expenses Spent */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.dashboard.monthlyExpenses}
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(summary.totalExpenses, currencyView)}
            </span>
            <span className="text-xs text-slate-500">/ $200 living target</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Living expenses only</p>
        </div>

        {/* Card 3: Savings & Emergency Allocated */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Savings & Reserves
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(
                summary.totalSavingsTransfers + summary.totalEmergencyTransfers,
                currencyView
              )}
            </span>
            <span className="text-xs text-slate-500">/ $110 planned</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Savings: {formatCurrency(summary.totalSavingsTransfers, currencyView)} | Emergency:{' '}
            {formatCurrency(summary.totalEmergencyTransfers, currencyView)}
          </p>
        </div>

        {/* Card 4: Investments & P&L */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.dashboard.currentInvestmentValue}
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(invSummary.currentPortfolioValue, currencyView)}
            </span>
            <span
              className={`text-xs font-bold ${
                invSummary.netInvestmentReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(invSummary.netInvestmentReturn, currencyView, true)} (
              {invSummary.returnPercentage >= 0 ? '+' : ''}
              {invSummary.returnPercentage}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Net Capital: {formatCurrency(invSummary.netInvestedCapital, currencyView)}
          </p>
        </div>
      </div>

      {/* Main Middle Row: Budget Health & Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Budget vs Actual Visual Bars (8 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.dashboard.budgetVsActual}
              </h3>
              <p className="text-xs text-slate-500">Monthly budget progress</p>
            </div>
            <button
              onClick={() => onNavigateToTab('budget')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Full Budget →
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {budget.map((b) => {
              const spent = actuals[b.category] || 0;
              const planned = b.plannedAmount;
              const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
              const isOver = spent > planned;
              const diff = planned - spent;

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {t.categories[b.category] || b.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-600">
                        {formatCurrency(spent, currencyView)} / {formatCurrency(planned, currencyView)}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isOver
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : spent === planned
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        }`}
                      >
                        {isOver
                          ? `Over by ${formatCurrency(Math.abs(diff), currencyView)}`
                          : `Left ${formatCurrency(diff, currencyView)}`}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : pct >= 80
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (spent / planned) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">{t.budget.remainingBudget}:</span>
              <span
                className={`font-mono text-sm font-bold ${
                  remainingBudget >= 0 ? 'text-blue-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(remainingBudget, currencyView)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Payday Cadence & Highlights (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Payday Checkup Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">{t.payday.title}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Two $160 payments = $320 monthly target
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{t.payday.payday1Header}</p>
                  <p className="text-[11px] text-slate-500">{t.payday.payday1Timing}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-700">
                    {formatCurrency(profile.payday1Amount, currencyView)}
                  </span>
                  <div className="mt-1">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200">
                      {t.payday.payday1CycleBadge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{t.payday.payday2Header}</p>
                  <p className="text-[11px] text-slate-500">{t.payday.payday2Timing}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-indigo-700">
                    {formatCurrency(profile.payday2Amount, currencyView)}
                  </span>
                  <div className="mt-1">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200">
                      {t.payday.payday2CycleBadge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('payday')}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
            >
              Adjust Payday Allocations →
            </button>
          </div>

          {/* Category Spending Distribution Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t.dashboard.spendingBreakdown}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                {formatCurrency(summary.totalExpenses, currencyView)}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {livingExpenseCategories
                .map((cat) => ({
                  category: cat,
                  spent: actuals[cat] || 0,
                  pct:
                    summary.totalExpenses > 0
                      ? ((actuals[cat] || 0) / summary.totalExpenses) * 100
                      : 0,
                }))
                .filter((item) => item.spent > 0)
                .sort((a, b) => b.spent - a.spent)
                .map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">
                        {t.categories[item.category] || item.category}
                      </span>
                      <span className="font-mono text-slate-500">
                        {formatCurrency(item.spent, currencyView)} ({item.pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}

              {summary.totalExpenses === 0 && (
                <p className="text-xs text-slate-400 py-2 text-center">
                  {lang === 'km'
                    ? 'មិនទាន់មានការចំណាយបានកត់ត្រានៅឡើយ'
                    : 'No living expenses recorded yet'}
                </p>
              )}
            </div>
          </div>

          {/* Accounting Protection Badge */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold text-blue-900">Double-Counting Protection</h4>
            </div>
            <p className="mt-1 text-[11px] text-blue-800 leading-relaxed">
              Transfers and savings are strictly separated from expenses for pristine balances.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest financial entries</p>
          </div>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Open All ({transactions.length}) →
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-2.5 px-3 font-semibold">{t.common.date}</th>
                <th className="py-2.5 px-3 font-semibold">{t.transactions.description}</th>
                <th className="py-2.5 px-3 font-semibold">{t.common.category}</th>
                <th className="py-2.5 px-3 font-semibold">{t.common.account}</th>
                <th className="py-2.5 px-3 text-right font-semibold">
                  {t.transactions.netMovement}
                </th>
                <th className="py-2.5 px-3 text-center font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 6).map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onEditTx && onEditTx(tx)}
                  className="hover:bg-blue-50/40 cursor-pointer transition group"
                  title={lang === 'km' ? 'ចុចដើម្បីកែសម្រួល' : 'Click to edit'}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-500">{tx.date}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 group-hover:text-blue-600 transition">
                    {tx.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                      {t.categories[tx.category] || tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{tx.account}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">
                    <span
                      className={
                        tx.netCashMovement > 0
                          ? 'text-emerald-600'
                          : tx.netCashMovement < 0
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }
                    >
                      {formatCurrency(tx.netCashMovement, currencyView, true)}
                    </span>
                  </td>
                  <td
                    className="py-2.5 px-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {onEditTx && (
                        <button
                          type="button"
                          onClick={() => onEditTx(tx)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          title={t.common.edit}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {onDeleteTx && (
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title={t.common.delete}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Dashboard */}
      <ConfirmModal
        isOpen={Boolean(deletingTx)}
        title={lang === 'km' ? 'លុបប្រតិបត្តិការ' : 'Delete Transaction'}
        message={
          deletingTx
            ? lang === 'km'
              ? `តើអ្នកប្រាកដជាចង់លុបប្រតិបត្តិការ "${deletingTx.description}" (${deletingTx.id} • ${formatCurrency(deletingTx.moneyOut || deletingTx.moneyIn, currencyView)}) មែនទេ?`
              : `Are you sure you want to delete transaction "${deletingTx.description}" (${deletingTx.id} • ${formatCurrency(deletingTx.moneyOut || deletingTx.moneyIn, currencyView)})?`
            : ''
        }
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        isDanger={true}
        onConfirm={() => {
          if (deletingTx && onDeleteTx) {
            onDeleteTx(deletingTx.id);
            setDeletingTx(null);
          }
        }}
        onCancel={() => setDeletingTx(null)}
      />
    </div>
  );
};
