import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BudgetView } from './components/BudgetView';
import { PaydayView } from './components/PaydayView';
import { TransactionsView } from './components/TransactionsView';
import { InvestmentsView } from './components/InvestmentsView';
import { ChecklistView } from './components/ChecklistView';
import { StartHereView } from './components/StartHereView';
import { TransactionModal } from './components/TransactionModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  LayoutDashboard,
  PieChart,
  CalendarDays,
  ReceiptText,
  Plus,
} from 'lucide-react';

import {
  Transaction,
  BudgetAllocation,
  InvestmentAsset,
  ActionItem,
  UserFinancialProfile,
  Language,
} from './types/finance';

import {
  loadProfile,
  saveProfile,
  loadBudget,
  saveBudget,
  loadTransactions,
  saveTransactions,
  loadInvestments,
  saveInvestments,
  loadActions,
  saveActions,
  resetAllData,
  DEFAULT_PROFILE,
  DEFAULT_BUDGET,
  DEFAULT_TRANSACTIONS,
  DEFAULT_INVESTMENTS,
  DEFAULT_ACTIONS,
} from './utils/storage';

import { exportPersonalFinanceWorkbook } from './utils/excelExport';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('finance_lang_v1') as Language) || 'en';
  });

  const [currencyView, setCurrencyView] = useState<'USD' | 'KHR'>(() => {
    return (localStorage.getItem('finance_currency_view_v1') as 'USD' | 'KHR') || 'USD';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [profile, setProfile] = useState<UserFinancialProfile>(loadProfile);
  const [budget, setBudget] = useState<BudgetAllocation[]>(loadBudget);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [investments, setInvestments] = useState<InvestmentAsset[]>(loadInvestments);
  const [actions, setActions] = useState<ActionItem[]>(loadActions);

  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', text: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      text,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('finance_lang_v1', lang);
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('finance_currency_view_v1', currencyView);
  }, [currencyView]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveInvestments(investments);
  }, [investments]);

  useEffect(() => {
    saveActions(actions);
  }, [actions]);

  // Handler to record Payday deposit
  const handleRecordPayday = (paydayNumber: 1 | 2) => {
    const today = new Date().toISOString().split('T')[0];
    const amount = paydayNumber === 1 ? profile.payday1Amount : profile.payday2Amount;
    const cycleLabel = paydayNumber === 1 ? '1 to 15' : '15 to 1';
    const desc =
      lang === 'km'
        ? `ប្រាក់ខែលើកទី${paydayNumber} (វដ្ត ${cycleLabel} • $${amount})`
        : `Payday ${paydayNumber} Salary (Cycle ${cycleLabel} • $${amount})`;

    const newTx: Transaction = {
      id: `TX-PAY-${paydayNumber}-${Date.now().toString().slice(-4)}`,
      date: today,
      type: 'salary_income',
      category: 'salary',
      description: desc,
      account: 'ABA Bank',
      moneyIn: amount,
      moneyOut: 0,
      netCashMovement: amount,
      notes: `Recorded on ${today}`,
    };

    setTransactions([newTx, ...transactions]);

    // Update checklist item
    const targetActionId = paydayNumber === 1 ? 'act-1' : 'act-2';
    setActions(
      actions.map((act) =>
        act.id === targetActionId
          ? { ...act, status: 'done', completedDate: today }
          : act
      )
    );

    addToast(
      'success',
      lang === 'km'
        ? `បានកត់ត្រាប្រាក់ខែលើកទី${paydayNumber} ($${amount}) ចូលគណនីរួចរាល់!`
        : `Payday ${paydayNumber} ($${amount}) salary deposited successfully!`
    );
  };

  const handleOpenNewTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleDeleteTx = (txId: string) => {
    const target = transactions.find((t) => t.id === txId);
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    addToast(
      'info',
      lang === 'km'
        ? `បានលុបប្រតិបត្តិការ "${target?.description || txId}" រួចរាល់!`
        : `Transaction "${target?.description || txId}" deleted successfully!`
    );
  };

  const handleBulkDeleteTxs = (txIds: string[]) => {
    setTransactions((prev) => prev.filter((t) => !txIds.includes(t.id)));
    addToast(
      'info',
      lang === 'km'
        ? `បានលុបប្រតិបត្តិការចំនួន ${txIds.length} រួចរាល់!`
        : `Deleted ${txIds.length} transactions successfully!`
    );
  };

  const handleDuplicateTx = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      notes: tx.notes ? `${tx.notes} (Copy)` : 'Copy',
    };
    setTransactions([duplicated, ...transactions]);
    addToast(
      'success',
      lang === 'km'
        ? `បានចម្លងប្រតិបត្តិការ៖ ${duplicated.description}!`
        : `Duplicated transaction: ${duplicated.description}!`
    );
  };

  const handleSaveTx = (savedTx: Transaction) => {
    if (editingTx) {
      setTransactions(
        transactions.map((tx) => (tx.id === savedTx.id ? savedTx : tx))
      );
      addToast(
        'info',
        lang === 'km' ? 'បានកែសម្រួលប្រតិបត្តិការរួចរាល់!' : 'Transaction updated successfully!'
      );
    } else {
      setTransactions([savedTx, ...transactions]);
      addToast(
        'success',
        lang === 'km'
          ? `បានកត់ត្រា៖ ${savedTx.description} ($${savedTx.moneyOut || savedTx.moneyIn})`
          : `Logged: ${savedTx.description} ($${savedTx.moneyOut || savedTx.moneyIn})`
      );
    }
  };

  const handleExportExcel = () => {
    exportPersonalFinanceWorkbook(profile, budget, transactions, investments, actions);
    addToast(
      'info',
      lang === 'km'
        ? 'កំពុងទាញយកឯកសារ Personal_Finance_Tracker_2026.xlsx!'
        : 'Personal_Finance_Tracker_2026.xlsx downloaded!'
    );
  };

  const handleSaveProfile = (newProfile: UserFinancialProfile) => {
    setProfile(newProfile);
    addToast(
      'success',
      lang === 'km' ? 'បានរក្សាទុកការកំណត់ជោគជ័យ!' : 'Financial settings saved successfully!'
    );
  };

  const handleResetData = () => {
    if (
      window.confirm(
        lang === 'km'
          ? 'តើអ្នកប្រាកដជាចង់សម្អាតទិន្នន័យទាំងអស់ដើម្បីចាប់ផ្តើមពីដើមមែនទេ?'
          : 'Are you sure you want to reset all data to a clean default state?'
      )
    ) {
      resetAllData();
      setProfile(DEFAULT_PROFILE);
      setBudget(DEFAULT_BUDGET);
      setTransactions([]);
      setInvestments([]);
      setActions(
        DEFAULT_ACTIONS.map((a) => ({ ...a, status: 'not_started', completedDate: undefined }))
      );
      addToast('warning', lang === 'km' ? 'បានកំណត់ទិន្នន័យឡើងវិញ!' : 'Data reset to defaults!');
    }
  };

  const handleLoadSampleData = () => {
    if (
      window.confirm(
        lang === 'km'
          ? 'តើអ្នកចង់ផ្ទុកទិន្នន័យគំរូហិរញ្ញវត្ថុពេញលេញ (ប្រាក់ខែ $320) មែនទេ?'
          : 'Load complete sample dataset matching your $320 salary budget?'
      )
    ) {
      setProfile(DEFAULT_PROFILE);
      setBudget(DEFAULT_BUDGET);
      setTransactions(DEFAULT_TRANSACTIONS);
      setInvestments(DEFAULT_INVESTMENTS);
      setActions(DEFAULT_ACTIONS);
      addToast('success', lang === 'km' ? 'បានផ្ទុកទិន្នន័យគំរូរួចរាល់!' : 'Sample data loaded!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16 sm:pb-0">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        currencyView={currencyView}
        setCurrencyView={setCurrencyView}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        onLoadSampleData={handleLoadSampleData}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            budget={budget}
            transactions={transactions}
            investments={investments}
            lang={lang}
            currencyView={currencyView}
            onOpenNewTx={handleOpenNewTx}
            onRecordPayday={handleRecordPayday}
            onNavigateToTab={setActiveTab}
            onEditTx={handleOpenEditTx}
            onDeleteTx={handleDeleteTx}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            budget={budget}
            setBudget={(newBudget) => {
              setBudget(newBudget);
              addToast('success', lang === 'km' ? 'បានរក្សាទុកថវិកា!' : 'Budget updated!');
            }}
            transactions={transactions}
            profile={profile}
            lang={lang}
            currencyView={currencyView}
          />
        )}

        {activeTab === 'payday' && (
          <PaydayView
            budget={budget}
            setBudget={(newBudget) => {
              setBudget(newBudget);
              addToast('success', lang === 'km' ? 'បានរក្សាទុកផែនការបើកប្រាក់ខែ!' : 'Payday plan updated!');
            }}
            transactions={transactions}
            profile={profile}
            lang={lang}
            currencyView={currencyView}
            onRecordPayday={handleRecordPayday}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            setTransactions={setTransactions}
            profile={profile}
            lang={lang}
            currencyView={currencyView}
            onOpenNewTx={handleOpenNewTx}
            onEditTx={handleOpenEditTx}
            onDeleteTx={handleDeleteTx}
            onBulkDeleteTxs={handleBulkDeleteTxs}
            onDuplicateTx={handleDuplicateTx}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsView
            investments={investments}
            setInvestments={(invs) => {
              setInvestments(invs);
              addToast('success', lang === 'km' ? 'បានរក្សាទុកការវិនិយោគ!' : 'Investments updated!');
            }}
            lang={lang}
            currencyView={currencyView}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistView
            actions={actions}
            setActions={(acts) => {
              setActions(acts);
              addToast('info', lang === 'km' ? 'បានកែប្រែកិច្ចការ!' : 'Checklist updated!');
            }}
            lang={lang}
          />
        )}

        {activeTab === 'startHere' && (
          <StartHereView
            lang={lang}
            onExportExcel={handleExportExcel}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTx}
        onDelete={handleDeleteTx}
        initialData={editingTx}
        lang={lang}
      />

      {/* Preferences / Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        lang={lang}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile Bottom Navigation Bar (sm:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-lg sm:hidden shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>{lang === 'km' ? 'សង្ខេប' : 'Dashboard'}</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            activeTab === 'budget' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <PieChart className="h-5 w-5" />
          <span>{lang === 'km' ? 'ថវិកា' : 'Budget'}</span>
        </button>

        {/* Center Floating Quick-Add Button */}
        <button
          onClick={handleOpenNewTx}
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-white active:scale-95 transition"
          title="Add Expense"
        >
          <Plus className="h-6 w-6" />
        </button>

        <button
          onClick={() => setActiveTab('payday')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            activeTab === 'payday' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          <span>{lang === 'km' ? 'បើកប្រាក់' : 'Payday'}</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            activeTab === 'transactions' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ReceiptText className="h-5 w-5" />
          <span>{lang === 'km' ? 'កំណត់ត្រា' : 'Ledger'}</span>
        </button>
      </nav>

      {/* Desktop Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'km'
              ? 'ប្រព័ន្ធគ្រប់គ្រងហិរញ្ញវត្ថុផ្ទាល់ខ្លួន — កំណែ ២០២៦'
              : 'Personal Finance Management System — 2026'}
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>English & ភាសាខ្មែរ</span>
            <span>•</span>
            <button
              onClick={handleExportExcel}
              className="text-blue-600 font-semibold hover:underline"
            >
              Export .xlsx
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
