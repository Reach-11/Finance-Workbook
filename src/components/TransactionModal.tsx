import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  BudgetCategory,
  Language,
} from '../types/finance';
import { translations } from '../utils/i18n';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  onDelete?: (txId: string) => void;
  initialData?: Transaction | null;
  lang: Language;
}

const TRANSACTION_TYPES: TransactionType[] = [
  'expense',
  'salary_income',
  'other_income',
  'transfer_between_accounts',
  'transfer_to_savings',
  'investment_contribution',
  'investment_withdrawal',
];

const CATEGORIES: BudgetCategory[] = [
  'food',
  'transport',
  'bills',
  'entertainment',
  'flexible_buffer',
  'savings',
  'emergency_fund',
  'investment',
  'shopping',
  'health',
  'education',
  'family',
  'salary',
  'other',
];

const POPULAR_ACCOUNTS = ['ABA Bank', 'Cash Wallet', 'Wing Bank', 'Bakong', 'TrueMoney'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  lang,
}) => {
  const t = translations[lang];

  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<BudgetCategory>('food');
  const [description, setDescription] = useState<string>('');
  const [account, setAccount] = useState<string>('ABA Bank');
  const [moneyIn, setMoneyIn] = useState<string>('');
  const [moneyOut, setMoneyOut] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setType(initialData.type);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setAccount(initialData.account);
      setMoneyIn(initialData.moneyIn > 0 ? String(initialData.moneyIn) : '');
      setMoneyOut(initialData.moneyOut > 0 ? String(initialData.moneyOut) : '');
      setNotes(initialData.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setType('expense');
      setCategory('food');
      setDescription('');
      setAccount('ABA Bank');
      setMoneyIn('');
      setMoneyOut('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'salary_income') {
      setCategory('salary');
      if (!moneyIn) setMoneyIn('160');
      setMoneyOut('');
    } else if (newType === 'transfer_to_savings') {
      setCategory('savings');
      if (!moneyOut) setMoneyOut('30');
      setMoneyIn('');
    } else if (newType === 'investment_contribution') {
      setCategory('investment');
      if (!moneyOut) setMoneyOut('5');
      setMoneyIn('');
    } else if (newType === 'expense') {
      setCategory('food');
      setMoneyIn('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inVal = Math.max(0, parseFloat(moneyIn) || 0);
    const outVal = Math.max(0, parseFloat(moneyOut) || 0);

    let net = 0;
    if (type === 'transfer_between_accounts') {
      net = 0;
    } else if (type === 'transfer_to_savings') {
      net = -outVal;
    } else if (type === 'investment_contribution') {
      net = -outVal;
    } else if (type === 'investment_withdrawal') {
      net = inVal;
    } else {
      net = inVal - outVal;
    }

    const transaction: Transaction = {
      id: initialData?.id || `TX-${Date.now().toString().slice(-6)}`,
      date,
      type,
      category,
      description: description.trim() || 'Untitled Transaction',
      account: account.trim() || 'Cash Wallet',
      moneyIn: inVal,
      moneyOut: outVal,
      netCashMovement: net,
      notes: notes.trim(),
    };

    onSave(transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {initialData
                ? lang === 'km'
                  ? 'កែសម្រួល / គ្រប់គ្រងប្រតិបត្តិការ'
                  : 'Manage Transaction'
                : t.transactions.newTransaction}
            </h2>
            {initialData && (
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                {initialData.id}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.common.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.common.type}
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {TRANSACTION_TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {t.transactionTypes[ty]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.common.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.categories[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Account / Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {t.common.account}
              </label>
              <input
                list="accounts-list"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                placeholder="e.g. ABA Bank, Cash"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <datalist id="accounts-list">
                {POPULAR_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {t.transactions.description}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Groceries, Lunch, Coffee, Fuel"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
              {[
                { label: 'Breakfast / Lunch', cat: 'food' },
                { label: 'Coffee', cat: 'entertainment' },
                { label: 'PassApp / Fuel', cat: 'transport' },
                { label: 'Groceries', cat: 'food' },
                { label: 'EDC Electric Bill', cat: 'bills' },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setDescription(s.label);
                    setCategory(s.cat as BudgetCategory);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  + {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Money In & Money Out */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-700">
                  {t.transactions.moneyIn}
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={moneyIn}
                    onChange={(e) => setMoneyIn(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700">
                  {t.transactions.moneyOut}
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={moneyOut}
                    onChange={(e) => setMoneyOut(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Quick Amount Chips */}
            {type === 'expense' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Quick Amount:</span>
                {[1, 2, 2.5, 5, 10, 15, 20].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMoneyOut(String(amt))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {t.common.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes or receipt memo"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  const confirmMsg =
                    lang === 'km'
                      ? `តើអ្នកប្រាកដជាចង់លុប "${initialData.description}" (${initialData.id}) មែនទេ?`
                      : `Are you sure you want to delete "${initialData.description}" (${initialData.id})?`;
                  if (window.confirm(confirmMsg)) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span>{lang === 'km' ? 'លុបប្រតិបត្តិការ' : 'Delete Transaction'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
};
