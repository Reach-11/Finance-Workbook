import React from 'react';
import {
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  Coins,
  PiggyBank,
  Scale,
} from 'lucide-react';
import { Language } from '../types/finance';
import { translations } from '../utils/i18n';

interface StartHereViewProps {
  lang: Language;
  onExportExcel: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const StartHereView: React.FC<StartHereViewProps> = ({
  lang,
  onExportExcel,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.startHere.title}</h2>
            <p className="text-xs text-slate-500">{t.startHere.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Financial Baseline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {t.startHere.salarySectionTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t.startHere.salarySectionDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Monthly Salary</span>
            <div className="text-lg font-bold text-blue-700 font-mono">$320.00 USD</div>
            <span className="text-[10px] text-slate-400">≈ 1,312,000 KHR</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              {lang === 'km' ? 'លើកទី១ (ថ្ងៃ ១-១៥)' : 'Payday 1 (Days 1–15)'}
            </span>
            <div className="text-lg font-bold text-blue-700 font-mono">$160.00 USD</div>
            <span className="text-[10px] text-slate-400">50% Allocation</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              {lang === 'km' ? 'លើកទី២ (ថ្ងៃ ១៥-១)' : 'Payday 2 (Days 15–1)'}
            </span>
            <div className="text-lg font-bold text-indigo-700 font-mono">$160.00 USD</div>
            <span className="text-[10px] text-slate-400">50% Allocation</span>
          </div>
        </div>
      </div>

      {/* Section 2: Budget Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {t.startHere.budgetSectionTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t.startHere.budgetSectionDesc}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Monthly Budget</th>
                <th className="p-3 text-right">Payday 1</th>
                <th className="p-3 text-right">Payday 2</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-semibold text-blue-700">Savings</td>
                <td className="p-3 text-right font-mono font-bold">$60.00</td>
                <td className="p-3 text-right font-mono">$30.00</td>
                <td className="p-3 text-right font-mono">$30.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Primary wealth growth (18.75%)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Food</td>
                <td className="p-3 text-right font-mono font-bold">$85.00</td>
                <td className="p-3 text-right font-mono">$45.00</td>
                <td className="p-3 text-right font-mono">$40.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Groceries and meals ($2.80/day)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Transport</td>
                <td className="p-3 text-right font-mono font-bold">$30.00</td>
                <td className="p-3 text-right font-mono">$15.00</td>
                <td className="p-3 text-right font-mono">$15.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Fuel, maintenance, ride-hailing</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Bills</td>
                <td className="p-3 text-right font-mono font-bold">$20.00</td>
                <td className="p-3 text-right font-mono font-bold text-blue-700">$20.00</td>
                <td className="p-3 text-right font-mono">$0.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Electricity, water, internet (1 to 15)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Entertainment</td>
                <td className="p-3 text-right font-mono font-bold">$25.00</td>
                <td className="p-3 text-right font-mono">$10.00</td>
                <td className="p-3 text-right font-mono">$15.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Coffee, social, personal treats</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-blue-700">Emergency Fund</td>
                <td className="p-3 text-right font-mono font-bold">$50.00</td>
                <td className="p-3 text-right font-mono">$25.00</td>
                <td className="p-3 text-right font-mono">$25.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Safety buffer for unforeseen events</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-indigo-700">Investment</td>
                <td className="p-3 text-right font-mono font-bold">$10.00</td>
                <td className="p-3 text-right font-mono">$5.00</td>
                <td className="p-3 text-right font-mono">$5.00</td>
                <td className="p-3 text-slate-500 text-[11px]">Fixed deposits, gold, ETFs</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Flexible Buffer</td>
                <td className="p-3 text-right font-mono font-bold">$40.00</td>
                <td className="p-3 text-right font-mono">$10.00</td>
                <td className="p-3 text-right font-mono font-bold text-indigo-700">$30.00</td>
                <td className="p-3 text-slate-500 text-[11px]">End of month variance cushion</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-bold text-blue-800">
                <td className="p-3">TOTAL ALLOCATION</td>
                <td className="p-3 text-right font-mono">$320.00</td>
                <td className="p-3 text-right font-mono">$160.00</td>
                <td className="p-3 text-right font-mono">$160.00</td>
                <td className="p-3 text-slate-600">100% of income assigned</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Section 3: Accounting Rules */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {t.startHere.accountingRulesTitle}
          </h3>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p>{t.startHere.rule1}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p>{t.startHere.rule2}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p>{t.startHere.rule3}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p>{t.startHere.rule4}</p>
          </div>
        </div>
      </div>

      {/* Section 4: Excel Export & Download */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                {t.startHere.excelExportTitle}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-600 max-w-xl">
              {t.startHere.excelExportDesc}
            </p>
          </div>

          <button
            onClick={onExportExcel}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 shrink-0 transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Personal_Finance_Tracker_2026.xlsx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
