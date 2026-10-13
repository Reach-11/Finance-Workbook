import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  Download,
  LayoutGrid,
  Table as TableIcon,
  CheckSquare,
  Square,
  Copy,
  RotateCcw,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  BudgetCategory,
  UserFinancialProfile,
  Language,
} from '../types/finance';
import { translations } from '../utils/i18n';
import { calculateFinancialSummary, formatCurrency } from '../utils/accounting';
import { ConfirmModal } from './ConfirmModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  profile: UserFinancialProfile;
  lang: Language;
  currencyView: 'USD' | 'KHR';
  onOpenNewTx: () => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx?: (txId: string) => void;
  onBulkDeleteTxs?: (txIds: string[]) => void;
  onDuplicateTx?: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  setTransactions,
  profile,
  lang,
  currencyView,
  onOpenNewTx,
  onEditTx,
  onDeleteTx,
  onBulkDeleteTxs,
  onDuplicateTx,
}) => {
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<'all' | 'cycle1' | 'cycle2'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc'>('date_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Deletion modal state
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const summary = calculateFinancialSummary(transactions, profile.openingCashBalance);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (selectedType !== 'all' && tx.type !== selectedType) return false;
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

        if (selectedCycle !== 'all') {
          const day = parseInt(tx.date.split('-')[2] || '1', 10);
          if (selectedCycle === 'cycle1' && day > 15) return false;
          if (selectedCycle === 'cycle2' && day <= 15) return false;
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchAcct = tx.account.toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchId = tx.id.toLowerCase().includes(q);
          if (!matchDesc && !matchAcct && !matchNotes && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') {
          const maxA = Math.max(a.moneyIn, a.moneyOut);
          const maxB = Math.max(b.moneyIn, b.moneyOut);
          return maxB - maxA;
        }
        return 0;
      });
  }, [transactions, selectedType, selectedCategory, selectedCycle, searchTerm, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCycle !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedCycle('all');
  };

  // Selection handlers
  const handleToggleSelect = (txId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(txId)) next.delete(txId);
      else next.add(txId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  // Duplication
  const handleDuplicate = (tx: Transaction) => {
    if (onDuplicateTx) {
      onDuplicateTx(tx);
    } else {
      const duplicated: Transaction = {
        ...tx,
        id: `TX-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        description: `${tx.description} (Copy)`,
        notes: tx.notes ? `${tx.notes} (Copy)` : 'Copy',
      };
      setTransactions([duplicated, ...transactions]);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Type',
      'Category',
      'Description',
      'Account',
      'Money In',
      'Money Out',
      'Net Movement',
      'Notes',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type,
      tx.category,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.account}"`,
      tx.moneyIn,
      tx.moneyOut,
      tx.netCashMovement,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t.transactions.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t.transactions.subtitle}</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={onOpenNewTx}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t.transactions.newTransaction}</span>
          </button>
        </div>
      </div>

      {/* Accounting Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">{t.transactions.totalIncome}</span>
          <div className="mt-1 text-base font-bold text-emerald-600 font-mono">
            {formatCurrency(summary.totalIncome, currencyView)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">{t.transactions.totalExpenses}</span>
          <div className="mt-1 text-base font-bold text-rose-600 font-mono">
            {formatCurrency(summary.totalExpenses, currencyView)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">{t.transactions.totalSavingsTransfers}</span>
          <div className="mt-1 text-base font-bold text-indigo-600 font-mono">
            {formatCurrency(summary.totalSavingsTransfers, currencyView)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">{t.transactions.totalInvestContributions}</span>
          <div className="mt-1 text-base font-bold text-amber-600 font-mono">
            {formatCurrency(summary.totalInvestContributions, currencyView)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">{t.transactions.totalInvestWithdrawals}</span>
          <div className="mt-1 text-base font-bold text-teal-600 font-mono">
            {formatCurrency(summary.totalInvestWithdrawals, currencyView)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">{t.transactions.netCashMovement}</span>
          <div
            className={`mt-1 text-base font-bold font-mono ${
              summary.netCashMovement >= 0 ? 'text-blue-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(summary.netCashMovement, currencyView, true)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-blue-200 bg-blue-50/70 p-3 shadow-xs">
          <span className="text-[11px] text-blue-800 font-semibold">
            {t.transactions.currentCashBalance}
          </span>
          <div className="mt-1 text-base font-black text-blue-900 font-mono">
            {formatCurrency(summary.currentCashBalance, currencyView)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        {/* Cycle Filter Pills & Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold text-[11px] mr-1">
              {lang === 'km' ? 'វដ្ត៖' : 'Cycle:'}
            </span>
            <button
              onClick={() => setSelectedCycle('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCycle === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.common.all}
            </button>
            <button
              onClick={() => setSelectedCycle('cycle1')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCycle === 'cycle1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-blue-600'
              }`}
            >
              {lang === 'km' ? 'វដ្តទី១ (១-១៥)' : 'Cycle 1 (1–15)'}
            </button>
            <button
              onClick={() => setSelectedCycle('cycle2')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCycle === 'cycle2'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-blue-600'
              }`}
            >
              {lang === 'km' ? 'វដ្តទី២ (១៥-១)' : 'Cycle 2 (15–1)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-amber-700 hover:bg-slate-100 transition"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{lang === 'km' ? 'សម្អាត' : 'Clear'}</span>
              </button>
            )}
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredTransactions.length} / {transactions.length}{' '}
              {lang === 'km' ? 'ប្រតិបត្តិការ' : 'entries'}
            </span>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.transactions.searchPlaceholder}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">
                {lang === 'km' ? 'គ្រប់ប្រភេទ' : 'All Types'}
              </option>
              {Object.keys(t.transactionTypes).map((k) => (
                <option key={k} value={k}>
                  {t.transactionTypes[k as TransactionType]}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">
                {lang === 'km' ? 'គ្រប់មុខទំនិញ' : 'All Categories'}
              </option>
              {Object.keys(t.categories).map((k) => (
                <option key={k} value={k}>
                  {t.categories[k as BudgetCategory]}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table View vs Cards View */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="px-3 py-3 w-8 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      {selectedIds.size > 0 &&
                      selectedIds.size === filteredTransactions.length ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">{t.common.date}</th>
                  <th className="px-3 py-3">{t.common.type}</th>
                  <th className="px-3 py-3">{t.common.category}</th>
                  <th className="px-3 py-3">{t.transactions.description}</th>
                  <th className="px-3 py-3">{t.common.account}</th>
                  <th className="px-3 py-3 text-right">{t.transactions.moneyIn}</th>
                  <th className="px-3 py-3 text-right">{t.transactions.moneyOut}</th>
                  <th className="px-3 py-3 text-right">{t.transactions.netMovement}</th>
                  <th className="px-3 py-3">{t.common.notes}</th>
                  {/* Sticky Right Actions Column */}
                  <th className="sticky right-0 bg-slate-50 px-4 py-3 text-center shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isSelected = selectedIds.has(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onEditTx(tx)}
                      className={`hover:bg-blue-50/40 cursor-pointer transition group ${
                        isSelected ? 'bg-blue-50/70' : ''
                      }`}
                      title={lang === 'km' ? 'ចុចដើម្បីកែសម្រួល' : 'Click to edit'}
                    >
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(tx.id)}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-500">{tx.date}</td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {t.transactionTypes[tx.type]}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          {t.categories[tx.category] || tx.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900 group-hover:text-blue-600 transition">
                        {tx.description}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{tx.account}</td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-600">
                        {tx.moneyIn > 0 ? formatCurrency(tx.moneyIn, currencyView) : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-rose-600">
                        {tx.moneyOut > 0 ? formatCurrency(tx.moneyOut, currencyView) : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold">
                        <span
                          className={
                            tx.netCashMovement > 0
                              ? 'text-emerald-600'
                              : tx.netCashMovement < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }
                        >
                          {formatCurrency(tx.netCashMovement, currencyView, true)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500 text-[11px] max-w-[140px] truncate">
                        {tx.notes || '-'}
                      </td>
                      {/* Sticky Actions column */}
                      <td
                        className="sticky right-0 bg-white group-hover:bg-blue-50/50 px-3 py-3 text-center shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTx(tx)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                            title={t.common.edit}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(tx)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTx(tx)}
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

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-xs text-slate-400">
                      {t.common.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTransactions.map((tx) => {
            const isSelected = selectedIds.has(tx.id);

            return (
              <div
                key={tx.id}
                onClick={() => onEditTx(tx)}
                className={`relative rounded-2xl border p-4 shadow-xs transition cursor-pointer hover:border-blue-300 ${
                  isSelected ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(tx.id);
                      }}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <div>
                      <span className="font-mono text-[11px] text-slate-400">{tx.date}</span>
                      <h4 className="font-semibold text-sm text-slate-900 mt-0.5 line-clamp-1">
                        {tx.description}
                      </h4>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-sm font-bold ${
                      tx.netCashMovement > 0
                        ? 'text-emerald-600'
                        : tx.netCashMovement < 0
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {formatCurrency(tx.netCashMovement, currencyView, true)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    {t.transactionTypes[tx.type]}
                  </span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                    {t.categories[tx.category] || tx.category}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                    {tx.account}
                  </span>
                </div>

                {tx.notes && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-1 italic">"{tx.notes}"</p>
                )}

                <div className="mt-3.5 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTx(tx);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{t.common.edit}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(tx);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTx(tx);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t.common.delete}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <span className="font-semibold text-slate-200">
            {selectedIds.size} {lang === 'km' ? 'បានជ្រើសរើស' : 'selected'}
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => setIsBulkDeleting(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-rose-500 transition active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Selected ({selectedIds.size})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Single Transaction Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTx)}
        title={lang === 'km' ? 'លុបប្រតិបត្តិការ' : 'Delete Transaction'}
        message={
          deletingTx
            ? lang === 'km'
              ? `តើអ្នកប្រាកដជាចង់លុប "${deletingTx.description}" (${deletingTx.id} • ${formatCurrency(deletingTx.moneyOut || deletingTx.moneyIn, currencyView)}) មែនទេ?`
              : `Are you sure you want to delete "${deletingTx.description}" (${deletingTx.id} • ${formatCurrency(deletingTx.moneyOut || deletingTx.moneyIn, currencyView)})?`
            : ''
        }
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        isDanger={true}
        onConfirm={() => {
          if (deletingTx) {
            if (onDeleteTx) {
              onDeleteTx(deletingTx.id);
            } else {
              setTransactions(transactions.filter((tx) => tx.id !== deletingTx.id));
            }
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(deletingTx.id);
              return next;
            });
            setDeletingTx(null);
          }
        }}
        onCancel={() => setDeletingTx(null)}
      />

      {/* Bulk Delete Modal */}
      <ConfirmModal
        isOpen={isBulkDeleting}
        title={
          lang === 'km'
            ? `លុប ${selectedIds.size} ប្រតិបត្តិការ`
            : `Delete ${selectedIds.size} Transactions`
        }
        message={
          lang === 'km'
            ? `តើអ្នកប្រាកដជាចង់លុបប្រតិបត្តិការទាំង ${selectedIds.size} នេះជាអចិន្ត្រៃយ៍មែនទេ?`
            : `Are you sure you want to permanently delete these ${selectedIds.size} transactions?`
        }
        confirmText={`Delete All (${selectedIds.size})`}
        cancelText={t.common.cancel}
        isDanger={true}
        onConfirm={() => {
          const idsToDelete = Array.from(selectedIds);
          if (onBulkDeleteTxs) {
            onBulkDeleteTxs(idsToDelete);
          } else {
            setTransactions(transactions.filter((t) => !selectedIds.has(t.id)));
          }
          setSelectedIds(new Set());
          setIsBulkDeleting(false);
        }}
        onCancel={() => setIsBulkDeleting(false)}
      />
    </div>
  );
};
