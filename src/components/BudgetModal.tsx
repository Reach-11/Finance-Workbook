import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { BudgetAllocation, Language } from '../types/finance';
import { translations } from '../utils/i18n';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetAllocation[];
  onSave: (updated: BudgetAllocation[]) => void;
  lang: Language;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSave,
  lang,
}) => {
  const t = translations[lang];
  const [items, setItems] = useState<BudgetAllocation[]>(budget);

  if (!isOpen) return null;

  const handleAmountChange = (index: number, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      plannedAmount: num,
      payday1Amount: Number((num / 2).toFixed(2)),
      payday2Amount: Number((num / 2).toFixed(2)),
    };
    setItems(updated);
  };

  const handlePayday1SplitChange = (index: number, p1Val: string) => {
    const p1 = Math.max(0, parseFloat(p1Val) || 0);
    const updated = [...items];
    const total = updated[index].plannedAmount;
    const p2 = Math.max(0, Number((total - p1).toFixed(2)));
    updated[index] = {
      ...updated[index],
      payday1Amount: p1,
      payday2Amount: p2,
    };
    setItems(updated);
  };

  const handlePayday2SplitChange = (index: number, p2Val: string) => {
    const p2 = Math.max(0, parseFloat(p2Val) || 0);
    const updated = [...items];
    const total = updated[index].plannedAmount;
    const p1 = Math.max(0, Number((total - p2).toFixed(2)));
    updated[index] = {
      ...updated[index],
      payday1Amount: p1,
      payday2Amount: p2,
    };
    setItems(updated);
  };

  const totalPlanned = items.reduce((sum, it) => sum + it.plannedAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.budget.editBudget}</h2>
            <p className="text-xs text-slate-500">
              Total monthly salary target: $320.00 USD ($160 × 2 paydays)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            <div className="grid grid-cols-12 gap-2 p-3 text-xs font-semibold bg-slate-50 text-slate-600">
              <div className="col-span-5">{t.budget.category}</div>
              <div className="col-span-3 text-right">{t.budget.planned} ($)</div>
              <div className="col-span-2 text-right">Payday 1 ($)</div>
              <div className="col-span-2 text-right">Payday 2 ($)</div>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 items-center gap-2 p-3 text-xs">
                <div className="col-span-5 font-semibold text-slate-800">
                  {t.categories[item.category] || item.category}
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.plannedAmount}
                    onChange={(e) => handleAmountChange(idx, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs text-blue-700 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.payday1Amount}
                    onChange={(e) => handlePayday1SplitChange(idx, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs text-blue-600 font-semibold focus:border-blue-500 focus:outline-none"
                    placeholder="P1"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.payday2Amount}
                    onChange={(e) => handlePayday2SplitChange(idx, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs text-indigo-600 font-semibold focus:border-indigo-500 focus:outline-none"
                    placeholder="P2"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-xs font-semibold text-slate-700">Total Planned:</span>
            <span
              className={`font-mono text-sm font-bold ${
                totalPlanned === 320 ? 'text-blue-700' : 'text-amber-600'
              }`}
            >
              ${totalPlanned.toFixed(2)} / $320.00 USD
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Check className="h-4 w-4" />
              <span>{t.common.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
