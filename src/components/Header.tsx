import React from 'react';
import {
  Wallet,
  Globe2,
  FileSpreadsheet,
  RotateCcw,
  LayoutDashboard,
  PieChart,
  CalendarDays,
  ReceiptText,
  TrendingUp,
  CheckSquare,
  HelpCircle,
  Coins,
  Settings,
} from 'lucide-react';
import { Language } from '../types/finance';
import { translations } from '../utils/i18n';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currencyView: 'USD' | 'KHR';
  setCurrencyView: (curr: 'USD' | 'KHR') => void;
  onExportExcel: () => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  currencyView,
  setCurrencyView,
  onExportExcel,
  onResetData,
  onLoadSampleData,
  onOpenSettings,
}) => {
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'budget', label: t.nav.budget, icon: PieChart },
    { id: 'payday', label: t.nav.paydayPlan, icon: CalendarDays },
    { id: 'transactions', label: t.nav.transactions, icon: ReceiptText },
    { id: 'investments', label: t.nav.investments, icon: TrendingUp },
    { id: 'checklist', label: t.nav.actions, icon: CheckSquare },
    { id: 'startHere', label: t.nav.startHere, icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Banner & Controls */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  {t.appTitle}
                </h1>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Action Tools & Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Mode: USD vs KHR */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
              <button
                onClick={() => setCurrencyView('USD')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium transition ${
                  currencyView === 'USD'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coins className="h-3.5 w-3.5" />
                USD ($)
              </button>
              <button
                onClick={() => setCurrencyView('KHR')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium transition ${
                  currencyView === 'KHR'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Khmer Riel (1 USD ≈ 4,100 KHR)"
              >
                <span className="font-bold">៛</span> KHR
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`rounded-md px-2.5 py-1.5 font-medium transition ${
                  lang === 'en'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('km')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium transition ${
                  lang === 'km'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                ខ្មែរ
              </button>
            </div>

            {/* Excel Download Button */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
              title="Download Excel Spreadsheet"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t.common.exportExcel}</span>
            </button>

            {/* Utility actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onLoadSampleData}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                title="Load sample data"
              >
                {t.common.loadSampleData}
              </button>
              <button
                onClick={onResetData}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-500 hover:border-rose-300 hover:text-rose-600 shadow-xs"
                title="Reset all records"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onOpenSettings}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-500 hover:border-blue-300 hover:text-blue-600 shadow-xs"
                title={lang === 'km' ? 'ការកំណត់' : 'Settings'}
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
