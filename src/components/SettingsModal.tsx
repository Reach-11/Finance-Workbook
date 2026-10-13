import React, { useState } from 'react';
import { X, Settings, Save } from 'lucide-react';
import { UserFinancialProfile, Language } from '../types/finance';
import { translations } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserFinancialProfile;
  onSave: (profile: UserFinancialProfile) => void;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  lang,
}) => {
  const t = translations[lang];

  const [salary, setSalary] = useState(String(profile.monthlySalary));
  const [openingBalance, setOpeningBalance] = useState(String(profile.openingCashBalance));
  const [exchangeRate, setExchangeRate] = useState(String(profile.khrExchangeRate || 4100));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sal = Math.max(0, parseFloat(salary) || 320);
    const half = Number((sal / 2).toFixed(2));
    const op = parseFloat(openingBalance) || 0;
    const rate = parseFloat(exchangeRate) || 4100;

    onSave({
      ...profile,
      monthlySalary: sal,
      payday1Amount: half,
      payday2Amount: half,
      openingCashBalance: op,
      khrExchangeRate: rate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'km' ? 'ការកំណត់ហិរញ្ញវត្ថុ' : 'Financial Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {lang === 'km' ? 'ប្រាក់ខែប្រចាំខែ (USD)' : 'Monthly Salary (USD)'}
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                $
              </span>
              <input
                type="number"
                step="1"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {lang === 'km'
                ? 'ចែកជា ២ ដង ($' + (parseFloat(salary) || 320) / 2 + ' / ដង)'
                : 'Split across two paydays ($' + (parseFloat(salary) || 320) / 2 + ' each)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {lang === 'km' ? 'សមតុល្យសាច់ប្រាក់ដើមគ្រា (USD)' : 'Opening Cash Balance (USD)'}
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {lang === 'km'
                ? 'សាច់ប្រាក់ដើមគ្រាមុនពេលកត់ត្រា'
                : 'Starting cash in wallet & accounts'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {lang === 'km' ? 'អត្រាប្តូរប្រាក់ (KHR / USD)' : 'Exchange Rate (KHR / USD)'}
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                ៛
              </span>
              <input
                type="number"
                step="10"
                min="3000"
                max="6000"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Standard reference: 4,100 KHR/USD
            </p>
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
              <Save className="h-4 w-4" />
              <span>{t.common.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
