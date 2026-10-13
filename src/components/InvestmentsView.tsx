import React, { useState } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { InvestmentAsset, Language } from '../types/finance';
import { translations } from '../utils/i18n';
import {
  calculatePortfolioSummary,
  calculateAssetPnl,
  formatCurrency,
} from '../utils/accounting';
import { InvestmentModal } from './InvestmentModal';
import { ConfirmModal } from './ConfirmModal';

interface InvestmentsViewProps {
  investments: InvestmentAsset[];
  setInvestments: (assets: InvestmentAsset[]) => void;
  lang: Language;
  currencyView: 'USD' | 'KHR';
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  investments,
  setInvestments,
  lang,
  currencyView,
}) => {
  const t = translations[lang];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<InvestmentAsset | null>(null);

  const summary = calculatePortfolioSummary(investments);

  const handleOpenNew = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: InvestmentAsset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleSave = (savedAsset: InvestmentAsset) => {
    if (editingAsset) {
      setInvestments(
        investments.map((a) => (a.id === savedAsset.id ? savedAsset : a))
      );
    } else {
      setInvestments([...investments, savedAsset]);
    }
  };

  const handleDelete = (asset: InvestmentAsset) => {
    setDeletingAsset(asset);
  };

  const handleConfirmDelete = () => {
    if (deletingAsset) {
      setInvestments(investments.filter((a) => a.id !== deletingAsset.id));
      setDeletingAsset(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t.investments.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t.investments.subtitle}</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 self-start rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t.investments.newAsset}</span>
        </button>
      </div>

      {/* Portfolio Performance Dashboard */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t.investments.portfolioSummary}
            </h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              summary.netInvestmentReturn >= 0
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
            }`}
          >
            {summary.netInvestmentReturn >= 0 ? 'Net Profitable' : 'Net Loss'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 font-medium">{t.investments.totalContributed}</span>
            <div className="mt-1 text-base font-bold text-slate-900 font-mono">
              {formatCurrency(summary.totalGrossContributed, currencyView)}
            </div>
            <span className="text-[10px] text-slate-400">
              Active: {formatCurrency(summary.netInvestedCapital, currencyView)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 font-medium">{t.investments.currentValue}</span>
            <div className="mt-1 text-base font-extrabold text-blue-700 font-mono">
              {formatCurrency(summary.currentPortfolioValue, currencyView)}
            </div>
            <span className="text-[10px] text-slate-400">Mark-to-market</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 font-medium">{t.investments.unrealizedPnl}</span>
            <div
              className={`mt-1 text-base font-bold font-mono ${
                summary.unrealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(summary.unrealizedPnl, currencyView, true)}
            </div>
            <span className="text-[10px] text-slate-400">Paper gains/losses</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 font-medium">{t.investments.realizedPnl}</span>
            <div
              className={`mt-1 text-base font-bold font-mono ${
                summary.realizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(summary.realizedPnl, currencyView, true)}
            </div>
            <span className="text-[10px] text-slate-400">Realized profits</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-500 font-medium">{t.investments.dividendsReceived}</span>
            <div className="mt-1 text-base font-bold text-indigo-700 font-mono">
              {formatCurrency(summary.totalDividendsInterest, currencyView)}
            </div>
            <span className="text-[10px] text-slate-400">
              Fees: {formatCurrency(summary.totalFeesAndTaxes, currencyView)}
            </span>
          </div>
        </div>

        {/* Big Net Return Callout */}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row">
          <div>
            <span className="text-xs font-semibold text-slate-600">
              Portfolio Return (P&L):
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-2xl font-black font-mono ${
                  summary.netInvestmentReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(summary.netInvestmentReturn, currencyView, true)}
              </span>
              <span
                className={`text-sm font-bold font-mono ${
                  summary.returnPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                ({summary.returnPercentage >= 0 ? '+' : ''}{summary.returnPercentage.toFixed(2)}% ROI)
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <div>Monthly Target: $10.00 / mo budget</div>
          </div>
        </div>
      </div>

      {/* Holdings & Asset Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50 text-xs font-semibold text-slate-800">
          {t.investments.assetTable} ({investments.length} Holdings)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3">{t.common.date}</th>
                <th className="px-4 py-3">{t.investments.assetName}</th>
                <th className="px-4 py-3">{t.investments.platform}</th>
                <th className="px-4 py-3">{t.investments.assetType}</th>
                <th className="px-4 py-3 text-right">{t.investments.initialContributed}</th>
                <th className="px-4 py-3 text-right">{t.investments.additionalContributed}</th>
                <th className="px-4 py-3 text-right">{t.investments.withdrawn}</th>
                <th className="px-4 py-3 text-right">{t.investments.dividends}</th>
                <th className="px-4 py-3 text-right">{t.investments.fees}</th>
                <th className="px-4 py-3 text-right">{t.investments.marketValue}</th>
                <th className="px-4 py-3 text-right">{t.investments.unrealizedPnl}</th>
                <th className="px-4 py-3 text-right">{t.investments.totalPnl}</th>
                <th className="px-4 py-3 text-right">{t.investments.returnPct}</th>
                <th className="px-4 py-3 text-center">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investments.map((asset) => {
                const pnl = calculateAssetPnl(asset);

                return (
                  <tr key={asset.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {asset.investmentDate}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {asset.assetName}
                      {asset.notes && (
                        <div className="text-[10px] text-slate-500 font-normal truncate max-w-xs">
                          {asset.notes}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-600">{asset.platform}</td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                        {t.assetTypes[asset.investmentType] || asset.investmentType}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatCurrency(asset.amountContributed, currencyView)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatCurrency(asset.additionalContributions, currencyView)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {asset.amountWithdrawn > 0 ? formatCurrency(asset.amountWithdrawn, currencyView) : '—'}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-indigo-700">
                      {asset.dividendsOrInterest > 0 ? formatCurrency(asset.dividendsOrInterest, currencyView) : '—'}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {asset.feesAndTaxes > 0 ? formatCurrency(asset.feesAndTaxes, currencyView) : '—'}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(asset.currentMarketValue, currencyView)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={pnl.unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatCurrency(pnl.unrealized, currencyView, true)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-black">
                      <span className={pnl.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatCurrency(pnl.totalPnl, currencyView, true)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={pnl.returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {pnl.returnPct >= 0 ? '+' : ''}{pnl.returnPct}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                          title={t.common.edit}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title={t.common.delete}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingAsset}
        lang={lang}
      />

      <ConfirmModal
        isOpen={Boolean(deletingAsset)}
        title={lang === 'km' ? 'លុបទ្រព្យវិនិយោគ' : 'Delete Investment Asset'}
        message={
          deletingAsset
            ? lang === 'km'
              ? `តើអ្នកប្រាកដជាចង់លុបទ្រព្យ "${deletingAsset.assetName}" (${formatCurrency(deletingAsset.currentMarketValue, currencyView)}) មែនទេ?`
              : `Are you sure you want to delete "${deletingAsset.assetName}" (${formatCurrency(deletingAsset.currentMarketValue, currencyView)})?`
            : ''
        }
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingAsset(null)}
      />
    </div>
  );
};
