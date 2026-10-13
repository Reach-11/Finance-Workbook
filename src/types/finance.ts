export type Language = 'en' | 'km';

export type TransactionType =
  | 'salary_income'
  | 'other_income'
  | 'expense'
  | 'transfer_to_savings'
  | 'transfer_between_accounts'
  | 'investment_contribution'
  | 'investment_withdrawal'
  | 'investment_profit'
  | 'investment_loss'
  | 'dividend_or_interest'
  | 'refund';

export type BudgetCategory =
  | 'savings'
  | 'food'
  | 'transport'
  | 'bills'
  | 'entertainment'
  | 'emergency_fund'
  | 'investment'
  | 'flexible_buffer'
  | 'salary'
  | 'shopping'
  | 'health'
  | 'education'
  | 'family'
  | 'other';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: BudgetCategory;
  description: string;
  account: string; // e.g. ABA Bank, Wing, Cash, ACLEDA
  moneyIn: number;
  moneyOut: number;
  netCashMovement: number; // positive = inflow, negative = outflow, 0 = internal transfer
  notes?: string;
}

export interface BudgetAllocation {
  id: string;
  category: BudgetCategory;
  plannedAmount: number;
  payday1Amount: number;
  payday2Amount: number;
  notes?: string;
}

export interface InvestmentAsset {
  id: string;
  investmentDate: string;
  assetName: string;
  platform: string; // e.g. ABA Bank, CSX Broker, Binance, SmartInvest
  investmentType: 'stocks_etf' | 'fixed_deposit' | 'gold' | 'crypto' | 'mutual_fund' | 'other';
  amountContributed: number; // Initial capital
  additionalContributions: number;
  amountWithdrawn: number;
  dividendsOrInterest: number;
  feesAndTaxes: number;
  currentMarketValue: number;
  realizedProfitLoss: number; // From closed positions/units sold
  notes?: string;
}

export type ActionStatus = 'not_started' | 'in_progress' | 'done' | 'skipped';

export interface ActionItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  status: ActionStatus;
  targetCategory?: BudgetCategory;
  amount?: number;
  completedDate?: string;
}

export interface UserFinancialProfile {
  monthlySalary: number; // 320
  payday1Amount: number; // 160
  payday2Amount: number; // 160
  currency: string; // 'USD'
  openingCashBalance: number; // Default e.g. 100
  khrExchangeRate: number; // 4100
}
