import * as XLSX from 'xlsx';
import {
  Transaction,
  BudgetAllocation,
  InvestmentAsset,
  ActionItem,
  UserFinancialProfile,
} from '../types/finance';
import { calculateCategoryActuals, calculateFinancialSummary, calculatePortfolioSummary } from './accounting';

export function exportPersonalFinanceWorkbook(
  profile: UserFinancialProfile,
  budget: BudgetAllocation[],
  transactions: Transaction[],
  investments: InvestmentAsset[],
  actions: ActionItem[]
) {
  const wb = XLSX.utils.book_new();

  // 1. "Start Here" sheet
  const startHereData = [
    ['PERSONAL FINANCE MANAGEMENT SYSTEM - 2026'],
    ['Created for tracking every dollar received, spent, saved, transferred, and invested.'],
    ['Monthly Salary:', `$${profile.monthlySalary.toFixed(2)} USD (Bi-weekly: $${profile.payday1Amount.toFixed(2)} x 2)`],
    [''],
    ['WORKSHEET DIRECTORY & INSTRUCTIONS:'],
    ['Sheet Name', 'Purpose', 'Key Accounting Rules'],
    ['Dashboard', 'High-level financial KPIs, cash positions, budget health', 'Updates automatically from transactions and assets.'],
    ['Monthly Budget', 'Planned allocations vs actual expenditures ($320 total)', 'Savings transfers separated so expenses are not double-counted.'],
    ['Payday Plan', 'Two $160 salary allocations per month', 'Allows adjusting bill timing between Payday 1 & Payday 2.'],
    ['Daily Transactions', 'Detailed ledger supporting 500+ transaction rows', 'Transfers between accounts = $0 net cash impact.'],
    ['Investment Tracker', 'Portfolio P&L, cost basis, unrealized & realized return', 'Withdrawals are capital returns, not profit. Realized = Sale - Cost Basis - Fees.'],
    ['Monthly Action Tracker', 'Monthly checklist with status tracking', 'Not Started, In Progress, Done, Skipped.'],
    [''],
    ['CORE ACCOUNTING PRINCIPLES:'],
    ['1. Transfers between your own accounts (e.g. ABA to Cash) never inflate income or expenses.'],
    ['2. Transferring to Savings ($60) and Emergency Fund ($50) moves money to dedicated reserve balances; it is not a loss/expense.'],
    ['3. Investment contributions ($10) are asset purchases, not automatic losses. Withdrawals are capital return, not profit.'],
    ['4. Investment Gain = (Market Value - Remaining Cost Basis) + Realized Gain + Dividends - Fees.'],
    ['5. Currency: USD (United States Dollar). Cambodian Riel (KHR) reference rate ≈ 4,100 KHR/USD.'],
  ];
  const wsStartHere = XLSX.utils.aoa_to_sheet(startHereData);
  wsStartHere['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsStartHere, 'Start Here');

  // 2. "Monthly Budget" sheet
  const actuals = calculateCategoryActuals(transactions);
  const budgetHeaders = [
    'Category',
    'Monthly Planned ($)',
    'Payday 1 Planned ($)',
    'Payday 2 Planned ($)',
    'Actual Spent / Allocated ($)',
    'Difference (Remaining $)',
    'Utilization (%)',
    'Status',
    'Notes',
  ];

  const budgetRows = budget.map((b) => {
    const act = actuals[b.category] || 0;
    const diff = b.plannedAmount - act;
    const util = b.plannedAmount > 0 ? (act / b.plannedAmount) * 100 : 0;
    const status = act > b.plannedAmount ? 'OVER BUDGET' : act === b.plannedAmount ? 'ON TARGET' : 'WITHIN BUDGET';
    return [
      b.category.toUpperCase().replace('_', ' '),
      b.plannedAmount,
      b.payday1Amount,
      b.payday2Amount,
      act,
      Number(diff.toFixed(2)),
      `${util.toFixed(1)}%`,
      status,
      b.notes || '',
    ];
  });

  const totalPlanned = budget.reduce((sum, b) => sum + b.plannedAmount, 0);
  const totalP1 = budget.reduce((sum, b) => sum + b.payday1Amount, 0);
  const totalP2 = budget.reduce((sum, b) => sum + b.payday2Amount, 0);
  const totalActual = budget.reduce((sum, b) => sum + (actuals[b.category] || 0), 0);
  const totalDiff = totalPlanned - totalActual;

  const budgetTable = [
    ['MONTHLY BUDGET ALLOCATION PLAN (2026)'],
    ['Salary Income Base:', profile.monthlySalary],
    [''],
    budgetHeaders,
    ...budgetRows,
    [''],
    [
      'TOTAL ALLOCATIONS',
      totalPlanned,
      totalP1,
      totalP2,
      Number(totalActual.toFixed(2)),
      Number(totalDiff.toFixed(2)),
      `${((totalActual / totalPlanned) * 100).toFixed(1)}%`,
      totalDiff >= 0 ? 'BALANCED' : 'DEFICIT',
      'Matches exactly $320 monthly salary baseline',
    ],
  ];
  const wsBudget = XLSX.utils.aoa_to_sheet(budgetTable);
  wsBudget['!cols'] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 15 },
    { wch: 16 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Monthly Budget');

  // 3. "Payday Plan" sheet
  const paydayHeaders = [
    'Category',
    'Monthly Budget ($)',
    'Payday 1 Allocation ($)',
    'Payday 2 Allocation ($)',
    'Actual Received / Allocated ($)',
    'Remaining ($)',
    'Timing Notes',
  ];
  const paydayRows = budget.map((b) => {
    const act = actuals[b.category] || 0;
    const remaining = b.plannedAmount - act;
    return [
      b.category.toUpperCase().replace('_', ' '),
      b.plannedAmount,
      b.payday1Amount,
      b.payday2Amount,
      act,
      Number(remaining.toFixed(2)),
      b.category === 'bills' ? 'Scheduled on Payday 1 (Cycle 1 to 15)' : 'Split evenly across cycles (1-15 & 15-1)',
    ];
  });
  const paydayTable = [
    ['PAYDAY ALLOCATION PLAN (BI-WEEKLY)'],
    ['Total Monthly Salary:', profile.monthlySalary],
    ['Payday 1 Target (Days 1 to 15):', profile.payday1Amount],
    ['Payday 2 Target (Days 15 to 1):', profile.payday2Amount],
    [''],
    paydayHeaders,
    ...paydayRows,
    [''],
    [
      'TOTAL ALLOCATIONS',
      totalPlanned,
      totalP1,
      totalP2,
      Number(totalActual.toFixed(2)),
      Number(totalDiff.toFixed(2)),
      'Payday 1 ($160) + Payday 2 ($160) = $320 Total',
    ],
  ];
  const wsPayday = XLSX.utils.aoa_to_sheet(paydayTable);
  wsPayday['!cols'] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 25 },
    { wch: 18 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPayday, 'Payday Plan');

  // 4. "Daily Transactions" sheet
  const txHeaders = [
    'Transaction ID',
    'Date',
    'Transaction Type',
    'Category',
    'Description',
    'Account / Method',
    'Money In ($)',
    'Money Out ($)',
    'Net Cash Movement ($)',
    'Notes',
  ];
  const txRows = transactions.map((t) => [
    t.id,
    t.date,
    t.type.replace(/_/g, ' ').toUpperCase(),
    t.category.toUpperCase(),
    t.description,
    t.account,
    t.moneyIn,
    t.moneyOut,
    t.netCashMovement,
    t.notes || '',
  ]);

  const summary = calculateFinancialSummary(transactions, profile.openingCashBalance);

  const txTable = [
    ['DAILY TRANSACTION TRACKER (500+ ROWS READY)'],
    ['Opening Cash Balance:', profile.openingCashBalance],
    ['Current Cash Balance:', summary.currentCashBalance],
    ['Total Income Recorded:', summary.totalIncome],
    ['Total Expenses Recorded:', summary.totalExpenses],
    ['Total Savings Transferred:', summary.totalSavingsTransfers],
    ['Net Cash Flow:', summary.netCashMovement],
    [''],
    txHeaders,
    ...txRows,
  ];
  const wsTransactions = XLSX.utils.aoa_to_sheet(txTable);
  wsTransactions['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
    { wch: 18 },
    { wch: 32 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Daily Transactions');

  // 5. "Investment Tracker" sheet
  const invSummary = calculatePortfolioSummary(investments);
  const invHeaders = [
    'Date',
    'Asset Name',
    'Platform / Broker',
    'Asset Class',
    'Contributed ($)',
    'Additional ($)',
    'Withdrawn ($)',
    'Dividends/Interest ($)',
    'Fees & Taxes ($)',
    'Current Value ($)',
    'Realized P&L ($)',
    'Unrealized P&L ($)',
    'Total Net P&L ($)',
    'Return Rate (%)',
    'Notes',
  ];
  const invRows = investments.map((inv) => {
    const gross = inv.amountContributed + inv.additionalContributions;
    const remainingCostBasis = Math.max(0, gross - inv.amountWithdrawn);
    const unrealized = inv.currentMarketValue - remainingCostBasis;
    const realized = inv.realizedProfitLoss || 0;
    const div = inv.dividendsOrInterest || 0;
    const fees = inv.feesAndTaxes || 0;
    const netPnl = unrealized + realized + div - fees;
    const returnPct = remainingCostBasis > 0 ? (netPnl / remainingCostBasis) * 100 : 0;

    return [
      inv.investmentDate,
      inv.assetName,
      inv.platform,
      inv.investmentType.toUpperCase(),
      inv.amountContributed,
      inv.additionalContributions,
      inv.amountWithdrawn,
      div,
      fees,
      inv.currentMarketValue,
      Number(realized.toFixed(2)),
      Number(unrealized.toFixed(2)),
      Number(netPnl.toFixed(2)),
      `${returnPct.toFixed(2)}%`,
      inv.notes || '',
    ];
  });

  const invTable = [
    ['INVESTMENT TRACKER - PROFIT & LOSS (P&L)'],
    ['Total Capital Contributed:', invSummary.totalGrossContributed],
    ['Total Capital Withdrawn:', invSummary.totalWithdrawn],
    ['Net Invested Capital:', invSummary.netInvestedCapital],
    ['Current Portfolio Value:', invSummary.currentPortfolioValue],
    ['Total Unrealized P&L:', invSummary.unrealizedPnl],
    ['Total Realized P&L:', invSummary.realizedPnl],
    ['Dividends & Interest:', invSummary.totalDividendsInterest],
    ['Total Fees & Taxes:', invSummary.totalFeesAndTaxes],
    ['Net Investment Return ($):', invSummary.netInvestmentReturn],
    ['Overall Portfolio ROI (%):', `${invSummary.returnPercentage.toFixed(2)}%`],
    [''],
    invHeaders,
    ...invRows,
  ];
  const wsInvestments = XLSX.utils.aoa_to_sheet(invTable);
  wsInvestments['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 15 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsInvestments, 'Investment Tracker');

  // 6. "Monthly Action Tracker" sheet
  const actionHeaders = ['ID', 'Financial Action Item', 'Target / Notes', 'Status', 'Completed Date'];
  const actionRows = actions.map((a) => [
    a.id,
    a.titleKey,
    a.descriptionKey,
    a.status.toUpperCase().replace('_', ' '),
    a.completedDate || (a.status === 'done' ? 'Completed' : 'Pending'),
  ]);
  const actionTable = [
    ['MONTHLY ACTION CHECKLIST (2026)'],
    ['Goal: Keep financial routines consistent every single month'],
    [''],
    actionHeaders,
    ...actionRows,
  ];
  const wsActions = XLSX.utils.aoa_to_sheet(actionTable);
  wsActions['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 45 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsActions, 'Monthly Action Tracker');

  // 7. "Dashboard" sheet
  const dashboardTable = [
    ['FINANCIAL DASHBOARD & EXECUTIVE SUMMARY (2026)'],
    ['Generated from Smart Personal Finance Manager'],
    [''],
    ['METRIC', 'AMOUNT (USD)', 'NOTES / ACCOUNTING RULE'],
    ['Monthly Salary Base', profile.monthlySalary, 'Twice monthly: $160 x 2'],
    ['Opening Cash Balance', profile.openingCashBalance, 'Initial liquid cash baseline'],
    ['Total Income Recorded', summary.totalIncome, 'Salary + other income + dividends/interest'],
    ['Total Living Expenses', summary.totalExpenses, 'Pure consumption expenses (food, transport, bills, etc.)'],
    ['Total Savings Transferred', summary.totalSavingsTransfers, 'Moved to savings; NOT double-counted as expense'],
    ['Total Emergency Fund Transferred', summary.totalEmergencyTransfers, 'Reserve capital cushion'],
    ['Total Investment Capital Deployed', summary.totalInvestContributions, 'Asset purchases, not an expense loss'],
    ['Current Liquid Cash in Hand/Bank', summary.currentCashBalance, 'Opening Balance + Net Cash Inflow/Outflow'],
    ['Total Investment Portfolio Value', invSummary.currentPortfolioValue, 'Current mark-to-market portfolio value'],
    ['Net Investment Return (P&L)', invSummary.netInvestmentReturn, 'Unrealized + Realized + Dividends - Fees'],
    ['Investment ROI (%)', `${invSummary.returnPercentage.toFixed(2)}%`, 'Gain over net contributed capital'],
    ['Remaining Unspent Budget', totalDiff, 'Planned $320 minus actual allocated/spent'],
  ];
  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardTable);
  wsDashboard['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // Generate binary and trigger download
  XLSX.writeFile(wb, 'Personal_Finance_Tracker_2026.xlsx');
}
