import React, { useState } from 'react';
import {
  CalendarCheck,
  Save,
} from 'lucide-react';
import {
  BudgetAllocation,
  Transaction,
  UserFinancialProfile,
  Language,
} from '../types/finance';
import { translations } from '../utils/i18n';
import { calculateCategoryActuals, formatCurrency } from '../utils/accounting';

interface PaydayViewProps {
  budget: BudgetAllocation[];
  setBudget: (b: BudgetAllocation[]) => void;
  transactions: Transaction[];
  profile: UserFinancialProfile;
  lang: Language;
  currencyView: 'USD' | 'KHR';
  onRecordPayday: (paydayNumber: 1 | 2) => void;
}

export const PaydayView: React.FC<PaydayViewProps> = ({
  budget,
  setBudget,
  transactions,
  profile,
  lang,
  currencyView,
  onRecordPayday,
}) => {
  const t = translations[lang];
  const actuals = calculateCategoryActuals(transactions);

  const [allocations, setAllocations] = useState<BudgetAllocation[]>(budget);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [autoBalance, setAutoBalance] = useState(true);

  const handleP1Change = (index: number, val: string) => {
    const p1 = Math.max(0, parseFloat(val) || 0);
    const updated = [...allocations];
    const item = updated[index];
    if (autoBalance) {
      const p2 = Math.max(0, Number((item.plannedAmount - p1).toFixed(2)));
      updated[index] = {
        ...item,
        payday1Amount: p1,
        payday2Amount: p2,
      };
    } else {
      updated[index] = {
        ...item,
        payday1Amount: p1,
        plannedAmount: Number((p1 + item.payday2Amount).toFixed(2)),
      };
    }
    setAllocations(updated);
    setHasChanges(true);
  };

  const handleP2Change = (index: number, val: string) => {
    const p2 = Math.max(0, parseFloat(val) || 0);
    const updated = [...allocations];
    const item = updated[index];
    if (autoBalance) {
      const p1 = Math.max(0, Number((item.plannedAmount - p2).toFixed(2)));
      updated[index] = {
        ...item,
        payday1Amount: p1,
        payday2Amount: p2,
      };
    } else {
      updated[index] = {
        ...item,
        payday2Amount: p2,
        plannedAmount: Number((item.payday1Amount + p2).toFixed(2)),
      };
    }
    setAllocations(updated);
    setHasChanges(true);
  };

  const handleQuickSplit = (index: number, mode: '50_50' | '100_p1' | '100_p2') => {
    const updated = [...allocations];
    const item = updated[index];
    const total = item.plannedAmount;
    if (mode === '50_50') {
      const half = Number((total / 2).toFixed(2));
      updated[index] = {
        ...item,
        payday1Amount: half,
        payday2Amount: Number((total - half).toFixed(2)),
      };
    } else if (mode === '100_p1') {
      updated[index] = {
        ...item,
        payday1Amount: total,
        payday2Amount: 0,
      };
    } else if (mode === '100_p2') {
      updated[index] = {
        ...item,
        payday1Amount: 0,
        payday2Amount: total,
      };
    }
    setAllocations(updated);
    setHasChanges(true);
  };

  const handleSaveAllocations = () => {
    setBudget(allocations);
    setHasChanges(false);
    setSuccessMsg(lang === 'km' ? 'បានរក្សាទុកផែនការបើកប្រាក់ខែ!' : 'Payday plan updated!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const totalMonthlyBudget = allocations.reduce((sum, b) => sum + b.plannedAmount, 0);
  const totalP1 = allocations.reduce((sum, b) => sum + b.payday1Amount, 0);
  const totalP2 = allocations.reduce((sum, b) => sum + b.payday2Amount, 0);
  const totalActual = allocations.reduce((sum, b) => sum + (actuals[b.category] || 0), 0);
  const totalRemaining = totalMonthlyBudget - totalActual;

  const p1Valid = totalP1 === profile.payday1Amount;
  const p2Valid = totalP2 === profile.payday2Amount;

  return (
    <div className="space-y-6">
      {/* Title & Payday Quick Deposit Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t.payday.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t.payday.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onRecordPayday(1)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 transition"
          >
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            <span>{t.payday.recordPayday1}</span>
          </button>
          <button
            onClick={() => onRecordPayday(2)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 transition"
          >
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            <span>{t.payday.recordPayday2}</span>
          </button>
        </div>
      </div>

      {/* Payday Structure Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Payday 1 Box (1 to 15) */}
        <div
          className={`rounded-2xl border p-5 transition bg-white shadow-xs ${
            p1Valid ? 'border-blue-200' : 'border-amber-300 bg-amber-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700">1st Paycheck</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
                  {t.payday.payday1CycleBadge}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {t.payday.payday1Header}
              </h3>
              <p className="text-xs text-slate-500">{t.payday.payday1Timing}</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-black text-slate-900">
                {formatCurrency(totalP1, currencyView)}
              </span>
              <p className="text-[11px] text-slate-500">
                Target: {formatCurrency(profile.payday1Amount, currencyView)}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold">{t.payday.scheduledPriorities} (1 to 15):</span>
              <span className="text-blue-700 font-mono font-bold">${totalP1.toFixed(2)}</span>
            </div>
            <p className="font-medium text-slate-700 leading-relaxed">
              {allocations
                .filter((b) => b.payday1Amount > 0)
                .map((b) => `${t.categories[b.category] || b.category} ($${b.payday1Amount})`)
                .join(', ')}
            </p>
          </div>
        </div>

        {/* Payday 2 Box (15 to 1) */}
        <div
          className={`rounded-2xl border p-5 transition bg-white shadow-xs ${
            p2Valid ? 'border-blue-200' : 'border-amber-300 bg-amber-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-700">2nd Paycheck</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-200">
                  {t.payday.payday2CycleBadge}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {t.payday.payday2Header}
              </h3>
              <p className="text-xs text-slate-500">{t.payday.payday2Timing}</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-black text-slate-900">
                {formatCurrency(totalP2, currencyView)}
              </span>
              <p className="text-[11px] text-slate-500">
                Target: {formatCurrency(profile.payday2Amount, currencyView)}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold">{t.payday.scheduledPriorities} (15 to 1):</span>
              <span className="text-indigo-700 font-mono font-bold">${totalP2.toFixed(2)}</span>
            </div>
            <p className="font-medium text-slate-700 leading-relaxed">
              {allocations
                .filter((b) => b.payday2Amount > 0)
                .map((b) => `${t.categories[b.category] || b.category} ($${b.payday2Amount})`)
                .join(', ')}
            </p>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs">
          <span className="text-blue-900 font-medium">
            {lang === 'km' ? 'អ្នកបានផ្លាស់ប្តូរការបែងចែក។ សូមរក្សាទុក៖' : 'Unsaved changes in payday distribution:'}
          </span>
          <button
            onClick={handleSaveAllocations}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save Payday Plan</span>
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-semibold text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Auto-balance Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoBalance}
            onChange={(e) => setAutoBalance(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium">{t.payday.autoBalanceMode}</span>
        </label>
        <span className="text-slate-500 text-[11px]">
          {lang === 'km'
            ? 'កែសម្រួលលើកទី១ (១-១៥) និងលើកទី២ (១៥-១)'
            : 'Manage Payday 1 (1–15) & Payday 2 (15–1)'}
        </span>
      </div>

      {/* Main Payday Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="px-4 py-3.5">{t.budget.category}</th>
                <th className="px-4 py-3.5 text-right">{t.payday.monthlyBudget}</th>
                <th className="px-4 py-3.5 text-right">
                  {t.payday.payday1Alloc} ($)
                  <span className="block text-[10px] text-blue-600 font-normal">
                    {lang === 'km' ? 'ថ្ងៃ ១ ដល់ ១៥' : '1 to 15'}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-right">
                  {t.payday.payday2Alloc} ($)
                  <span className="block text-[10px] text-indigo-600 font-normal">
                    {lang === 'km' ? 'ថ្ងៃ ១៥ ដល់ ១' : '15 to 1'}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-right">{t.payday.actualAllocated}</th>
                <th className="px-4 py-3.5 text-right">{t.payday.remaining}</th>
                <th className="px-4 py-3.5">Due Date & Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((b, idx) => {
                const act = actuals[b.category] || 0;
                const rem = b.plannedAmount - act;

                return (
                  <tr key={b.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {t.categories[b.category] || b.category}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(b.plannedAmount, currencyView)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max={autoBalance ? b.plannedAmount : undefined}
                        value={b.payday1Amount}
                        onChange={(e) => handleP1Change(idx, e.target.value)}
                        className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs text-blue-700 font-bold focus:border-blue-500 focus:outline-none"
                        placeholder="P1"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max={autoBalance ? b.plannedAmount : undefined}
                        value={b.payday2Amount}
                        onChange={(e) => handleP2Change(idx, e.target.value)}
                        className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs text-indigo-700 font-bold focus:border-indigo-500 focus:outline-none"
                        placeholder="P2"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-700">
                      {formatCurrency(act, currencyView)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      <span className={rem >= 0 ? 'text-blue-700' : 'text-rose-600'}>
                        {formatCurrency(rem, currencyView, true)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                      <div>
                        {b.category === 'bills'
                          ? '100% on Payday 1 (1 to 15)'
                          : b.category === 'flexible_buffer'
                          ? '75% on Payday 2 (15 to 1)'
                          : 'Split across cycles'}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickSplit(idx, '50_50')}
                          className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          50/50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSplit(idx, '100_p1')}
                          className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 hover:bg-blue-100"
                        >
                          P1 100%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSplit(idx, '100_p2')}
                          className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 hover:bg-indigo-100"
                        >
                          P2 100%
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                <td className="px-4 py-3.5">TOTAL PAYDAY ALLOCATIONS</td>
                <td className="px-4 py-3.5 text-right font-mono text-blue-700">
                  {formatCurrency(totalMonthlyBudget, currencyView)}
                </td>
                <td
                  className={`px-4 py-3.5 text-right font-mono ${
                    p1Valid ? 'text-blue-700' : 'text-amber-600'
                  }`}
                >
                  ${totalP1.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-3.5 text-right font-mono ${
                    p2Valid ? 'text-indigo-700' : 'text-amber-600'
                  }`}
                >
                  ${totalP2.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {formatCurrency(totalActual, currencyView)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono">
                  <span className={totalRemaining >= 0 ? 'text-blue-700' : 'text-rose-600'}>
                    {formatCurrency(totalRemaining, currencyView, true)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs">
                  {p1Valid && p2Valid ? (
                    <span className="text-emerald-700 font-semibold">✓ Balanced ($160 + $160 = $320)</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">⚠️ Needs $160 each</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
