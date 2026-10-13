import React, { useState } from 'react';
import {
  Edit3,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  BudgetAllocation,
  Transaction,
  UserFinancialProfile,
  Language,
} from '../types/finance';
import { translations } from '../utils/i18n';
import {
  calculateCategoryActuals,
  calculateFinancialSummary,
  formatCurrency,
} from '../utils/accounting';
import { BudgetModal } from './BudgetModal';

interface BudgetViewProps {
  budget: BudgetAllocation[];
  setBudget: (b: BudgetAllocation[]) => void;
  transactions: Transaction[];
  profile: UserFinancialProfile;
  lang: Language;
  currencyView: 'USD' | 'KHR';
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  setBudget,
  transactions,
  profile,
  lang,
  currencyView,
}) => {
  const t = translations[lang];
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const actuals = calculateCategoryActuals(transactions);
  const summary = calculateFinancialSummary(transactions, profile.openingCashBalance);

  const totalPlanned = budget.reduce((sum, b) => sum + b.plannedAmount, 0);
  const totalActual = budget.reduce((sum, b) => sum + (actuals[b.category] || 0), 0);
  const remainingBudget = totalPlanned - totalActual;

  return (
    <div className="space-y-6">
      {/* Header and Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t.budget.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t.budget.subtitle}</p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-400 hover:text-blue-600 transition"
        >
          <Edit3 className="h-4 w-4" />
          <span>{t.budget.editBudget}</span>
        </button>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.budget.plannedTotal}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalPlanned, currencyView)}
          </div>
          <span className="text-[11px] text-slate-500">Monthly budget total</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.budget.actualExpenses}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatCurrency(summary.totalExpenses, currencyView)}
          </div>
          <span className="text-[11px] text-slate-500">Living expenses spent</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.budget.totalAllocations}
          </span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalActual, currencyView)}
          </div>
          <span className="text-[11px] text-slate-500">
            {totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(0) : 0}% deployed
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.budget.remainingBudget}
          </span>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              remainingBudget >= 0 ? 'text-blue-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(remainingBudget, currencyView)}
          </div>
          <span className="text-[11px] text-slate-500">
            {remainingBudget >= 0 ? 'Available surplus' : 'Budget exceeded'}
          </span>
        </div>
      </div>

      {/* Main Budget Breakdown Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3.5">{t.budget.category}</th>
                <th className="px-4 py-3.5 text-right">{t.budget.planned}</th>
                <th className="px-4 py-3.5 text-right">Payday 1 / 2</th>
                <th className="px-4 py-3.5 text-right">{t.budget.actual}</th>
                <th className="px-4 py-3.5 text-right">{t.budget.difference}</th>
                <th className="px-4 py-3.5 text-center">{t.budget.progress}</th>
                <th className="px-4 py-3.5 text-center">{t.budget.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.map((b) => {
                const act = actuals[b.category] || 0;
                const diff = b.plannedAmount - act;
                const pct = b.plannedAmount > 0 ? (act / b.plannedAmount) * 100 : 0;
                const isOver = act > b.plannedAmount;
                const isExact = act === b.plannedAmount;

                return (
                  <tr key={b.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {t.categories[b.category] || b.category}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(b.plannedAmount, currencyView)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                      ${b.payday1Amount} / ${b.payday2Amount}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(act, currencyView)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      <span className={diff >= 0 ? 'text-blue-700' : 'text-rose-600'}>
                        {formatCurrency(diff, currencyView, true)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="mx-auto w-24">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              isOver
                                ? 'bg-rose-500'
                                : pct >= 90
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isOver
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : isExact
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        }`}
                      >
                        {isOver ? (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            {t.dashboard.overBudget}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            {t.dashboard.onTrack}
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                <td className="px-4 py-3.5">TOTAL MONTHLY ALLOCATION</td>
                <td className="px-4 py-3.5 text-right font-mono text-blue-700">
                  {formatCurrency(totalPlanned, currencyView)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                  $160 / $160
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                  {formatCurrency(totalActual, currencyView)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono">
                  <span className={remainingBudget >= 0 ? 'text-blue-700' : 'text-rose-600'}>
                    {formatCurrency(remainingBudget, currencyView, true)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  {totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(0) : 0}%
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                    BALANCED
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <BudgetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        budget={budget}
        onSave={(updated) => setBudget(updated)}
        lang={lang}
      />
    </div>
  );
};
