export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kudiTag: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar: string;
  biometricsEnabled: boolean;
  twoFactorEnabled: boolean;
  notificationPrefs: {
    email: boolean;
    push: boolean;
    sms: boolean;
    budgetAlerts: boolean;
  };
  createdAt: string;
}

export type TransactionType =
  | 'transfer_in'
  | 'transfer_out'
  | 'deposit'
  | 'withdrawal'
  | 'bill_payment'
  | 'expense'
  | 'income'
  | 'savings_deposit'
  | 'savings_withdrawal';

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Bills'
  | 'Shopping'
  | 'Entertainment'
  | 'Education'
  | 'Healthcare'
  | 'Income'
  | 'Savings'
  | 'Other';

export interface Transaction {
  id: string;
  reference: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory;
  description: string;
  counterparty: string;
  status: 'successful' | 'pending' | 'failed';
  date: string;
  notes?: string;
  metadata?: {
    billType?: string;
    provider?: string;
    customerId?: string;
    tokenCode?: string;
    units?: string;
    meterNumber?: string;
    packagePlan?: string;
    recipientId?: string;
    recipientName?: string;
    recipientTag?: string;
    recipientAccount?: string;
    senderId?: string;
    senderName?: string;
    senderTag?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    fee?: number;
    method?: string;
    manualRecord?: boolean;
    affectsBalance?: boolean;
  };
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  isLocked: boolean;
  createdAt: string;
  progressPercentage: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'transaction' | 'budget' | 'savings' | 'security' | 'system';
  read: boolean;
  date: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'transaction' | 'account' | 'bill' | 'other';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  accountNumber: string;
  bankName: string;
  kudiTag: string;
}

export interface AnalyticsData {
  categoryBreakdown: Record<string, number>;
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVolume: number;
  totalTransactions: number;
  openTickets: number;
  totalDeposits: number;
}
