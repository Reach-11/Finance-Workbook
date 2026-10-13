import { Transaction, InvestmentAsset, BudgetAllocation, BudgetCategory } from '../types/finance';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavingsTransfers: number;
  totalEmergencyTransfers: number;
  totalInvestContributions: number;
  totalInvestWithdrawals: number;
  totalDividendsInterest: number;
  netCashMovement: number;
  currentCashBalance: number;
}

export interface InvestmentPortfolioSummary {
  totalContributed: number;
  totalAdditionalContributed: number;
  totalGrossContributed: number;
  totalWithdrawn: number;
  netInvestedCapital: number;
  currentPortfolioValue: number;
  totalFeesAndTaxes: number;
  totalDividendsInterest: number;
  realizedPnl: number;
  unrealizedPnl: number;
  netInvestmentReturn: number;
  returnPercentage: number;
}

/**
 * Calculates net cash movement for a given transaction based on accounting rules.
 */
export function calculateNetMovement(
  type: string,
  moneyIn: number,
  moneyOut: number
): number {
  if (type === 'transfer_between_accounts') {
    // Internal transfer does not alter the user's aggregate cash balance across accounts
    return 0;
  }
  return Number((moneyIn - moneyOut).toFixed(2));
}

/**
 * Aggregates all transactions into standard accounting totals.
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  openingBalance: number = 100
): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavingsTransfers = 0;
  let totalEmergencyTransfers = 0;
  let totalInvestContributions = 0;
  let totalInvestWithdrawals = 0;
  let totalDividendsInterest = 0;
  let netCashMovement = 0;

  for (const tx of transactions) {
    const inAmt = Number(tx.moneyIn) || 0;
    const outAmt = Number(tx.moneyOut) || 0;

    switch (tx.type) {
      case 'salary_income':
      case 'other_income':
      case 'refund':
        totalIncome += inAmt;
        netCashMovement += inAmt;
        break;

      case 'dividend_or_interest':
      case 'investment_profit':
        totalIncome += inAmt;
        totalDividendsInterest += inAmt;
        netCashMovement += inAmt;
        break;

      case 'expense':
      case 'investment_loss':
        totalExpenses += outAmt;
        netCashMovement -= outAmt;
        break;

      case 'transfer_to_savings':
        if (tx.category === 'emergency_fund') {
          totalEmergencyTransfers += outAmt;
        } else {
          totalSavingsTransfers += outAmt;
        }
        // Money moved from liquid cash into savings balance
        netCashMovement -= outAmt;
        break;

      case 'transfer_between_accounts':
        // Own accounts transfer - 0 net cash flow
        break;

      case 'investment_contribution':
        totalInvestContributions += outAmt;
        // Money moved from liquid cash into investment portfolio
        netCashMovement -= outAmt;
        break;

      case 'investment_withdrawal':
        totalInvestWithdrawals += inAmt;
        // Money returned from investment portfolio back to liquid cash
        netCashMovement += inAmt;
        break;

      default:
        netCashMovement += inAmt - outAmt;
        break;
    }
  }

  const currentCashBalance = Number((openingBalance + netCashMovement).toFixed(2));

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalSavingsTransfers: Number(totalSavingsTransfers.toFixed(2)),
    totalEmergencyTransfers: Number(totalEmergencyTransfers.toFixed(2)),
    totalInvestContributions: Number(totalInvestContributions.toFixed(2)),
    totalInvestWithdrawals: Number(totalInvestWithdrawals.toFixed(2)),
    totalDividendsInterest: Number(totalDividendsInterest.toFixed(2)),
    netCashMovement: Number(netCashMovement.toFixed(2)),
    currentCashBalance,
  };
}

/**
 * Calculates actual spending or allocation per budget category.
 */
export function calculateCategoryActuals(
  transactions: Transaction[]
): Record<BudgetCategory, number> {
  const actuals: Partial<Record<BudgetCategory, number>> = {};

  for (const tx of transactions) {
    const cat = tx.category;
    if (!cat) continue;

    // Determine relevant amount for category:
    // Expenses count outAmt
    // Savings/Emergency/Investment contributions count outAmt
    // Salary counts inAmt
    let amount = 0;
    if (tx.type === 'expense') {
      amount = tx.moneyOut;
    } else if (tx.type === 'transfer_to_savings') {
      amount = tx.moneyOut;
    } else if (tx.type === 'investment_contribution') {
      amount = tx.moneyOut;
    } else if (tx.type === 'salary_income') {
      amount = tx.moneyIn;
    } else if (tx.type === 'refund') {
      // Refund reduces expenses in that category
      amount = -tx.moneyIn;
    } else if (tx.moneyOut > 0) {
      amount = tx.moneyOut;
    }

    actuals[cat] = (actuals[cat] || 0) + amount;
  }

  // Ensure 2 decimal places
  for (const key in actuals) {
    const k = key as BudgetCategory;
    actuals[k] = Number((actuals[k] || 0).toFixed(2));
  }

  return actuals as Record<BudgetCategory, number>;
}

/**
 * Portfolio P&L calculations according to strict prompt guidelines:
 * - Unrealized P&L = currentMarketValue - remainingCostBasis
 * - Realized P&L = sale proceeds - cost basis of units sold - fees
 * - Net return = unrealized + realized + dividends - fees
 * - Handles missing data gracefully.
 */
export function calculateAssetPnl(asset: InvestmentAsset) {
  const grossContributed = asset.amountContributed + asset.additionalContributions;
  // Remaining cost basis after withdrawals:
  const remainingCostBasis = Math.max(0, grossContributed - asset.amountWithdrawn);
  
  const hasMarketValue = asset.currentMarketValue !== undefined && asset.currentMarketValue !== null;
  const unrealized = hasMarketValue ? asset.currentMarketValue - remainingCostBasis : 0;
  const realized = asset.realizedProfitLoss || 0;
  const dividends = asset.dividendsOrInterest || 0;
  const fees = asset.feesAndTaxes || 0;

  const totalPnl = unrealized + realized + dividends - fees;
  const returnPct = remainingCostBasis > 0 ? (totalPnl / remainingCostBasis) * 100 : 0;

  return {
    grossContributed,
    remainingCostBasis,
    unrealized: Number(unrealized.toFixed(2)),
    realized: Number(realized.toFixed(2)),
    dividends: Number(dividends.toFixed(2)),
    fees: Number(fees.toFixed(2)),
    totalPnl: Number(totalPnl.toFixed(2)),
    returnPct: Number(returnPct.toFixed(2)),
    hasMarketValue,
  };
}

export function calculatePortfolioSummary(assets: InvestmentAsset[]): InvestmentPortfolioSummary {
  let totalContributed = 0;
  let totalAdditionalContributed = 0;
  let totalWithdrawn = 0;
  let currentPortfolioValue = 0;
  let totalFeesAndTaxes = 0;
  let totalDividendsInterest = 0;
  let realizedPnl = 0;
  let unrealizedPnl = 0;

  for (const asset of assets) {
    totalContributed += asset.amountContributed || 0;
    totalAdditionalContributed += asset.additionalContributions || 0;
    totalWithdrawn += asset.amountWithdrawn || 0;
    currentPortfolioValue += asset.currentMarketValue || 0;
    totalFeesAndTaxes += asset.feesAndTaxes || 0;
    totalDividendsInterest += asset.dividendsOrInterest || 0;
    realizedPnl += asset.realizedProfitLoss || 0;

    const pnl = calculateAssetPnl(asset);
    unrealizedPnl += pnl.unrealized;
  }

  const totalGrossContributed = totalContributed + totalAdditionalContributed;
  const netInvestedCapital = Math.max(0, totalGrossContributed - totalWithdrawn);
  const netInvestmentReturn = unrealizedPnl + realizedPnl + totalDividendsInterest - totalFeesAndTaxes;
  const returnPercentage = netInvestedCapital > 0 ? (netInvestmentReturn / netInvestedCapital) * 100 : 0;

  return {
    totalContributed: Number(totalContributed.toFixed(2)),
    totalAdditionalContributed: Number(totalAdditionalContributed.toFixed(2)),
    totalGrossContributed: Number(totalGrossContributed.toFixed(2)),
    totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
    netInvestedCapital: Number(netInvestedCapital.toFixed(2)),
    currentPortfolioValue: Number(currentPortfolioValue.toFixed(2)),
    totalFeesAndTaxes: Number(totalFeesAndTaxes.toFixed(2)),
    totalDividendsInterest: Number(totalDividendsInterest.toFixed(2)),
    realizedPnl: Number(realizedPnl.toFixed(2)),
    unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
    netInvestmentReturn: Number(netInvestmentReturn.toFixed(2)),
    returnPercentage: Number(returnPercentage.toFixed(2)),
  };
}

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'KHR' = 'USD',
  showSign: boolean = false
): string {
  const num = Number(amount) || 0;
  const sign = showSign && num > 0 ? '+' : '';
  if (currency === 'KHR') {
    const khr = Math.round(num * 4100);
    return `${sign}${khr.toLocaleString()} ៛`;
  }
  return `${sign}$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
