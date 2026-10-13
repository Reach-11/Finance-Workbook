import {
  Transaction,
  BudgetAllocation,
  InvestmentAsset,
  ActionItem,
  UserFinancialProfile,
} from '../types/finance';

const STORAGE_KEYS = {
  PROFILE: 'finance_profile_v1',
  BUDGET: 'finance_budget_v1',
  TRANSACTIONS: 'finance_transactions_v1',
  INVESTMENTS: 'finance_investments_v1',
  ACTIONS: 'finance_actions_v1',
  LANG: 'finance_lang_v1',
  CURRENCY_VIEW: 'finance_currency_view_v1',
};

export const DEFAULT_PROFILE: UserFinancialProfile = {
  monthlySalary: 320,
  payday1Amount: 160,
  payday2Amount: 160,
  currency: 'USD',
  openingCashBalance: 120,
  khrExchangeRate: 4100,
};

export const DEFAULT_BUDGET: BudgetAllocation[] = [
  { id: 'b-savings', category: 'savings', plannedAmount: 60, payday1Amount: 30, payday2Amount: 30, notes: 'Target: $60/month building wealth' },
  { id: 'b-food', category: 'food', plannedAmount: 85, payday1Amount: 45, payday2Amount: 40, notes: 'Daily meals, groceries & cooking' },
  { id: 'b-transport', category: 'transport', plannedAmount: 30, payday1Amount: 15, payday2Amount: 15, notes: 'Fuel, motorbike maintenance, PassApp' },
  { id: 'b-bills', category: 'bills', plannedAmount: 20, payday1Amount: 20, payday2Amount: 0, notes: 'Electricity, water, mobile data (due early)' },
  { id: 'b-entertainment', category: 'entertainment', plannedAmount: 25, payday1Amount: 10, payday2Amount: 15, notes: 'Coffee, social outings with friends' },
  { id: 'b-emergency', category: 'emergency_fund', plannedAmount: 50, payday1Amount: 25, payday2Amount: 25, notes: '3-6 months safety net for unexpected events' },
  { id: 'b-investment', category: 'investment', plannedAmount: 10, payday1Amount: 5, payday2Amount: 5, notes: 'Long-term compounding asset accumulation' },
  { id: 'b-buffer', category: 'flexible_buffer', plannedAmount: 40, payday1Amount: 10, payday2Amount: 30, notes: 'Shock absorber for price increases or misc' },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-001',
    date: '2026-10-01',
    type: 'salary_income',
    category: 'salary',
    description: 'Payday 1 - Salary Deposit (50%)',
    account: 'ABA Bank',
    moneyIn: 160.0,
    moneyOut: 0,
    netCashMovement: 160.0,
    notes: 'First half of October salary',
  },
  {
    id: 'TX-002',
    date: '2026-10-02',
    type: 'transfer_to_savings',
    category: 'savings',
    description: 'Auto-transfer to High Yield Savings',
    account: 'ABA Bank -> Savings',
    moneyIn: 0,
    moneyOut: 30.0,
    netCashMovement: -30.0,
    notes: 'Payday 1 savings allocation',
  },
  {
    id: 'TX-003',
    date: '2026-10-02',
    type: 'transfer_to_savings',
    category: 'emergency_fund',
    description: 'Emergency Fund Deposit',
    account: 'ABA Bank -> Emergency Pot',
    moneyIn: 0,
    moneyOut: 25.0,
    netCashMovement: -25.0,
    notes: 'Payday 1 emergency fund buffer',
  },
  {
    id: 'TX-004',
    date: '2026-10-03',
    type: 'expense',
    category: 'bills',
    description: 'Electricity & Water Bill (EDC)',
    account: 'ABA Bank',
    moneyIn: 0,
    moneyOut: 14.5,
    netCashMovement: -14.5,
    notes: 'Utility payment for home',
  },
  {
    id: 'TX-005',
    date: '2026-10-04',
    type: 'investment_contribution',
    category: 'investment',
    description: 'Monthly Investment Allotment',
    account: 'ABA Bank -> Brokerage',
    moneyIn: 0,
    moneyOut: 5.0,
    netCashMovement: -5.0,
    notes: 'Payday 1 investment contribution',
  },
  {
    id: 'TX-006',
    date: '2026-10-05',
    type: 'transfer_between_accounts',
    category: 'other',
    description: 'ATM Cash Withdrawal for Daily Pocket',
    account: 'ABA Bank -> Cash Wallet',
    moneyIn: 20.0,
    moneyOut: 20.0,
    netCashMovement: 0,
    notes: 'Internal cash withdrawal; 0 net change in net wealth',
  },
  {
    id: 'TX-007',
    date: '2026-10-06',
    type: 'expense',
    category: 'food',
    description: 'Weekly Market Groceries & Rice',
    account: 'Cash Wallet',
    moneyIn: 0,
    moneyOut: 18.25,
    netCashMovement: -18.25,
    notes: 'Fresh veggies, meat, and jasmine rice',
  },
  {
    id: 'TX-008',
    date: '2026-10-07',
    type: 'expense',
    category: 'transport',
    description: 'Gasoline & Motorbike Oil Change',
    account: 'Cash Wallet',
    moneyIn: 0,
    moneyOut: 6.5,
    netCashMovement: -6.5,
    notes: 'Full tank + routine oil service',
  },
  {
    id: 'TX-009',
    date: '2026-10-08',
    type: 'expense',
    category: 'entertainment',
    description: 'Coffee & Weekend Study Session',
    account: 'ABA Bank',
    moneyIn: 0,
    moneyOut: 4.5,
    netCashMovement: -4.5,
    notes: 'Brown Coffee with colleagues',
  },
  {
    id: 'TX-010',
    date: '2026-10-09',
    type: 'dividend_or_interest',
    category: 'investment',
    description: 'Monthly Savings Interest Received',
    account: 'ABA Bank',
    moneyIn: 0.85,
    moneyOut: 0,
    netCashMovement: 0.85,
    notes: 'Compounded monthly deposit interest',
  },
];

export const DEFAULT_INVESTMENTS: InvestmentAsset[] = [
  {
    id: 'inv-1',
    investmentDate: '2026-08-15',
    assetName: 'ABA High Yield Fixed Deposit (USD)',
    platform: 'ABA Bank',
    investmentType: 'fixed_deposit',
    amountContributed: 50.0,
    additionalContributions: 10.0,
    amountWithdrawn: 0,
    dividendsOrInterest: 2.15,
    feesAndTaxes: 0.12,
    currentMarketValue: 62.03,
    realizedProfitLoss: 0,
    notes: '6.5% p.a. term deposit for wealth preservation',
  },
  {
    id: 'inv-2',
    investmentDate: '2026-09-01',
    assetName: 'S&P 500 Global Equity Index (Fractional)',
    platform: 'Global Brokerage',
    investmentType: 'stocks_etf',
    amountContributed: 25.0,
    additionalContributions: 5.0,
    amountWithdrawn: 0,
    dividendsOrInterest: 0.45,
    feesAndTaxes: 0.2,
    currentMarketValue: 33.6,
    realizedProfitLoss: 0,
    notes: 'Long-term global economic growth tracker',
  },
  {
    id: 'inv-3',
    investmentDate: '2026-07-20',
    assetName: 'Physical Gold Mini Bar (Chi / Gram)',
    platform: 'Local Certified Goldsmith',
    investmentType: 'gold',
    amountContributed: 40.0,
    additionalContributions: 0,
    amountWithdrawn: 0,
    dividendsOrInterest: 0,
    feesAndTaxes: 0.5,
    currentMarketValue: 43.8,
    realizedProfitLoss: 0,
    notes: 'Traditional Cambodian inflation hedge',
  },
];

export const DEFAULT_ACTIONS: ActionItem[] = [
  {
    id: 'act-1',
    titleKey: 'Receiving Payday 1 ($160 USD)',
    descriptionKey: 'Verify first half of monthly salary deposited into account',
    status: 'done',
    targetCategory: 'salary',
    amount: 160,
    completedDate: '2026-10-01',
  },
  {
    id: 'act-2',
    titleKey: 'Receiving Payday 2 ($160 USD)',
    descriptionKey: 'Verify second half of monthly salary received around 15th-20th',
    status: 'in_progress',
    targetCategory: 'salary',
    amount: 160,
  },
  {
    id: 'act-3',
    titleKey: 'Recording daily transactions',
    descriptionKey: 'Log all cash, bank transfer, and QR pay items daily without missing',
    status: 'in_progress',
  },
  {
    id: 'act-4',
    titleKey: 'Saving the planned amount ($60 USD)',
    descriptionKey: 'Transfer full $60 ($30 per payday) into dedicated savings account',
    status: 'in_progress',
    targetCategory: 'savings',
    amount: 60,
  },
  {
    id: 'act-5',
    titleKey: 'Adding to the emergency fund ($50 USD)',
    descriptionKey: 'Allocate $50 ($25 per payday) to 3-6 month safety reserve pot',
    status: 'in_progress',
    targetCategory: 'emergency_fund',
    amount: 50,
  },
  {
    id: 'act-6',
    titleKey: 'Reviewing expenses',
    descriptionKey: 'Check food, transport, and bills to ensure no category is overspent',
    status: 'in_progress',
  },
  {
    id: 'act-7',
    titleKey: 'Reviewing investment performance',
    descriptionKey: 'Track market values, dividends, and ensure $10 monthly goal met',
    status: 'in_progress',
    targetCategory: 'investment',
    amount: 10,
  },
  {
    id: 'act-8',
    titleKey: 'Checking investment fees & broker charges',
    descriptionKey: 'Confirm maintenance fees and foreign exchange fees are minimal',
    status: 'not_started',
  },
  {
    id: 'act-9',
    titleKey: 'Completing the month-end financial review',
    descriptionKey: 'Reconcile ending cash balance with bank statement and roll forward',
    status: 'not_started',
  },
];

export function loadProfile(): UserFinancialProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserFinancialProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadBudget(): BudgetAllocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return raw ? JSON.parse(raw) : DEFAULT_BUDGET;
  } catch {
    return DEFAULT_BUDGET;
  }
}

export function saveBudget(budget: BudgetAllocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  } catch (e) {
    console.error('Failed to save budget', e);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : DEFAULT_TRANSACTIONS;
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function loadInvestments(): InvestmentAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    return raw ? JSON.parse(raw) : DEFAULT_INVESTMENTS;
  } catch {
    return DEFAULT_INVESTMENTS;
  }
}

export function saveInvestments(investments: InvestmentAsset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  } catch (e) {
    console.error('Failed to save investments', e);
  }
}

export function loadActions(): ActionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    return raw ? JSON.parse(raw) : DEFAULT_ACTIONS;
  } catch {
    return DEFAULT_ACTIONS;
  }
}

export function saveActions(actions: ActionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch (e) {
    console.error('Failed to save actions', e);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INVESTMENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIONS);
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
}
