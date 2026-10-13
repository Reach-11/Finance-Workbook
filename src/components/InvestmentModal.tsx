import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InvestmentAsset, Language } from '../types/finance';
import { translations } from '../utils/i18n';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: InvestmentAsset) => void;
  initialData?: InvestmentAsset | null;
  lang: Language;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang,
}) => {
  const t = translations[lang];

  const [investmentDate, setInvestmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [assetName, setAssetName] = useState<string>('');
  const [platform, setPlatform] = useState<string>('ABA Bank');
  const [investmentType, setInvestmentType] = useState<
    'stocks_etf' | 'fixed_deposit' | 'gold' | 'crypto' | 'mutual_fund' | 'other'
  >('fixed_deposit');
  const [amountContributed, setAmountContributed] = useState<string>('10');
  const [additionalContributions, setAdditionalContributions] = useState<string>('0');
  const [amountWithdrawn, setAmountWithdrawn] = useState<string>('0');
  const [dividendsOrInterest, setDividendsOrInterest] = useState<string>('0');
  const [feesAndTaxes, setFeesAndTaxes] = useState<string>('0');
  const [currentMarketValue, setCurrentMarketValue] = useState<string>('10');
  const [realizedProfitLoss, setRealizedProfitLoss] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setInvestmentDate(initialData.investmentDate);
      setAssetName(initialData.assetName);
      setPlatform(initialData.platform);
      setInvestmentType(initialData.investmentType);
      setAmountContributed(String(initialData.amountContributed));
      setAdditionalContributions(String(initialData.additionalContributions));
      setAmountWithdrawn(String(initialData.amountWithdrawn));
      setDividendsOrInterest(String(initialData.dividendsOrInterest));
      setFeesAndTaxes(String(initialData.feesAndTaxes));
      setCurrentMarketValue(String(initialData.currentMarketValue));
      setRealizedProfitLoss(String(initialData.realizedProfitLoss));
      setNotes(initialData.notes || '');
    } else {
      setInvestmentDate(new Date().toISOString().split('T')[0]);
      setAssetName('');
      setPlatform('ABA Bank');
      setInvestmentType('fixed_deposit');
      setAmountContributed('10');
      setAdditionalContributions('0');
      setAmountWithdrawn('0');
      setDividendsOrInterest('0');
      setFeesAndTaxes('0');
      setCurrentMarketValue('10');
      setRealizedProfitLoss('0');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset: InvestmentAsset = {
      id: initialData?.id || `inv-${Date.now()}`,
      investmentDate,
      assetName: assetName.trim() || 'Investment Holding',
      platform: platform.trim() || 'Provider',
      investmentType,
      amountContributed: parseFloat(amountContributed) || 0,
      additionalContributions: parseFloat(additionalContributions) || 0,
      amountWithdrawn: parseFloat(amountWithdrawn) || 0,
      dividendsOrInterest: parseFloat(dividendsOrInterest) || 0,
      feesAndTaxes: parseFloat(feesAndTaxes) || 0,
      currentMarketValue: parseFloat(currentMarketValue) || 0,
      realizedProfitLoss: parseFloat(realizedProfitLoss) || 0,
      notes: notes.trim(),
    };

    onSave(asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">
            {initialData ? t.common.edit : t.investments.newAsset}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.assetName}
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                required
                placeholder="e.g. S&P 500 ETF, Fixed Deposit"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.platform}
              </label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                placeholder="e.g. ABA Bank, Brokerage"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.assetType}
              </label>
              <select
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(t.assetTypes).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.common.date}
              </label>
              <input
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Capital Contributed & Additional */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.initialContributed} ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountContributed}
                onChange={(e) => setAmountContributed(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.additionalContributed} ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={additionalContributions}
                onChange={(e) => setAdditionalContributions(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.withdrawn} ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountWithdrawn}
                onChange={(e) => setAmountWithdrawn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Current Market Value & Performance metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-blue-700">
                {t.investments.marketValue} ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentMarketValue}
                onChange={(e) => setCurrentMarketValue(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs text-blue-700 font-bold font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.dividends} ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={dividendsOrInterest}
                onChange={(e) => setDividendsOrInterest(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.fees} ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={feesAndTaxes}
                onChange={(e) => setFeesAndTaxes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Realized Profit/Loss & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.investments.realizedPnl} ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={realizedProfitLoss}
                onChange={(e) => setRealizedProfitLoss(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.common.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Strategy notes, ticker, etc."
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
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
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
