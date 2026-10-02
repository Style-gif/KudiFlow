import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kudiTag: string; // e.g. @adaeze
  passwordHash: string;
  pinHash: string; // 4-digit PIN
  accountNumber: string; // 10-digit Nigerian NUBAN
  bankName: string;
  balance: number; // in Naira
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

export interface Transaction {
  id: string;
  reference: string;
  userId: string;
  type: 'transfer_in' | 'transfer_out' | 'deposit' | 'withdrawal' | 'bill_payment' | 'expense' | 'income' | 'savings_deposit' | 'savings_withdrawal';
  amount: number;
  category: 'Food' | 'Transportation' | 'Bills' | 'Shopping' | 'Entertainment' | 'Education' | 'Healthcare' | 'Income' | 'Savings' | 'Other';
  description: string;
  counterparty: string;
  status: 'successful' | 'pending' | 'failed';
  date: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  alertThreshold: number; // percentage (e.g. 80)
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

export interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  supportTickets: SupportTicket[];
}

// Helpers for crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_kudiflow_salt_2026').digest('hex');
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + '_kudiflow_pin_salt').digest('hex');
}

function generateNuban(): string {
  // 10 digit Nigerian NUBAN
  return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
}

function generateRef(prefix = 'KDF'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${dateStr}-${rand}`;
}

// Seed initial database if not exists
function getInitialData(): DatabaseSchema {
  const adminId = 'usr_admin_001';
  const adaezeId = 'usr_adaeze_002';
  const babatundeId = 'usr_babatunde_003';
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const users: User[] = [
    {
      id: adminId,
      name: 'Oluwaseun Balogun',
      email: 'shopatstylestessentials@gmail.com',
      phone: '08023456789',
      kudiTag: '@seun_admin',
      passwordHash: hashPassword('AdminPass2026!'),
      pinHash: hashPin('1234'),
      accountNumber: '9012345678',
      bankName: 'Providus Bank / KudiFlow',
      balance: 1450000,
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      biometricsEnabled: true,
      twoFactorEnabled: true,
      notificationPrefs: { email: true, push: true, sms: true, budgetAlerts: true },
      createdAt: oneWeekAgo,
    },
    {
      id: adaezeId,
      name: 'Adaeze Okafor',
      email: 'adaeze@kudiflow.ng',
      phone: '08139876543',
      kudiTag: '@adaeze',
      passwordHash: hashPassword('NaijaFlow2026!'),
      pinHash: hashPin('2580'),
      accountNumber: '9087654321',
      bankName: 'Providus Bank / KudiFlow',
      balance: 385000,
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&h=200&q=80',
      biometricsEnabled: true,
      twoFactorEnabled: false,
      notificationPrefs: { email: true, push: true, sms: false, budgetAlerts: true },
      createdAt: oneWeekAgo,
    },
    {
      id: babatundeId,
      name: 'Babatunde Adeleke',
      email: 'babatunde@kudiflow.ng',
      phone: '07051239874',
      kudiTag: '@tunde',
      passwordHash: hashPassword('TundePass2026!'),
      pinHash: hashPin('1122'),
      accountNumber: '9055443322',
      bankName: 'Providus Bank / KudiFlow',
      balance: 195000,
      role: 'user',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      biometricsEnabled: false,
      twoFactorEnabled: false,
      notificationPrefs: { email: true, push: true, sms: true, budgetAlerts: true },
      createdAt: oneWeekAgo,
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx_001',
      reference: 'KDF-20261001-981240',
      userId: adaezeId,
      type: 'deposit',
      amount: 250000,
      category: 'Income',
      description: 'Wallet funding via Providus Virtual Account',
      counterparty: 'Access Bank / GTCO Inflow',
      status: 'successful',
      date: oneWeekAgo,
      metadata: { method: 'Bank Transfer' }
    },
    {
      id: 'tx_002',
      reference: 'KDF-20261001-981241',
      userId: adaezeId,
      type: 'bill_payment',
      amount: 15000,
      category: 'Bills',
      description: 'Eko Electricity (EKEDC) Prepaid Token',
      counterparty: 'EKEDC Eko Electric',
      status: 'successful',
      date: threeDaysAgo,
      metadata: {
        meterNumber: '04218934512',
        tokenCode: '4521-8930-1124-7890-3341',
        units: '182.4 kWh'
      }
    },
    {
      id: 'tx_003',
      reference: 'KDF-20261001-981242',
      userId: adaezeId,
      type: 'expense',
      amount: 28500,
      category: 'Food',
      description: 'Supermarket Groceries & Market Shopping',
      counterparty: 'Shoprite Ikeja City Mall',
      status: 'successful',
      date: yesterday,
      notes: 'Monthly staples purchase'
    },
    {
      id: 'tx_004',
      reference: 'KDF-20261001-981243',
      userId: adaezeId,
      type: 'bill_payment',
      amount: 5000,
      category: 'Bills',
      description: 'MTN 10GB Monthly Data Bundle',
      counterparty: 'MTN Nigeria (08139876543)',
      status: 'successful',
      date: yesterday,
      metadata: { plan: '10GB 30-Days' }
    },
    {
      id: 'tx_005',
      reference: 'KDF-20261001-981244',
      userId: adaezeId,
      type: 'transfer_out',
      amount: 20000,
      category: 'Other',
      description: 'Transfer to Babatunde Adeleke',
      counterparty: 'Babatunde Adeleke (@tunde)',
      status: 'successful',
      date: now,
      metadata: { recipientTag: '@tunde', recipientId: babatundeId }
    },
    {
      id: 'tx_006',
      reference: 'KDF-20261001-981245',
      userId: babatundeId,
      type: 'transfer_in',
      amount: 20000,
      category: 'Income',
      description: 'Money received from Adaeze Okafor',
      counterparty: 'Adaeze Okafor (@adaeze)',
      status: 'successful',
      date: now,
      metadata: { senderTag: '@adaeze', senderId: adaezeId }
    }
  ];

  const budgets: Budget[] = [
    {
      id: 'bdg_001',
      userId: adaezeId,
      category: 'Food',
      limit: 80000,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      alertThreshold: 80
    },
    {
      id: 'bdg_002',
      userId: adaezeId,
      category: 'Bills',
      limit: 50000,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      alertThreshold: 80
    },
    {
      id: 'bdg_003',
      userId: adaezeId,
      category: 'Transportation',
      limit: 35000,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      alertThreshold: 80
    },
    {
      id: 'bdg_004',
      userId: adaezeId,
      category: 'Shopping',
      limit: 40000,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      alertThreshold: 80
    }
  ];

  const savings: SavingsGoal[] = [
    {
      id: 'svg_001',
      userId: adaezeId,
      name: 'Lekki Apartment Rent 2027',
      targetAmount: 1800000,
      currentAmount: 720000,
      targetDate: '2027-03-31',
      category: 'Housing',
      isLocked: false,
      createdAt: oneWeekAgo
    },
    {
      id: 'svg_002',
      userId: adaezeId,
      name: 'MacBook Pro M3 for Tech Work',
      targetAmount: 1200000,
      currentAmount: 840000,
      targetDate: '2026-12-15',
      category: 'Gadgets',
      isLocked: false,
      createdAt: oneWeekAgo
    },
    {
      id: 'svg_003',
      userId: adaezeId,
      name: 'Emergency Rainy Day Fund',
      targetAmount: 500000,
      currentAmount: 350000,
      targetDate: '2026-11-30',
      category: 'Emergency',
      isLocked: true,
      createdAt: oneWeekAgo
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_001',
      userId: adaezeId,
      title: 'Successful Transfer Sent',
      message: 'You sent ₦20,000 to Babatunde Adeleke (@tunde).',
      type: 'transaction',
      read: false,
      date: now
    },
    {
      id: 'notif_002',
      userId: adaezeId,
      title: 'Electricity Token Generated',
      message: 'EKEDC prepaid meter token for ₦15,000 generated successfully: 4521-8930-1124-7890-3341',
      type: 'transaction',
      read: true,
      date: threeDaysAgo
    },
    {
      id: 'notif_003',
      userId: adaezeId,
      title: 'Budget Alert: Food Category',
      message: 'You have spent 35.6% of your monthly Food budget.',
      type: 'budget',
      read: true,
      date: yesterday
    },
    {
      id: 'notif_004',
      userId: babatundeId,
      title: 'Money Received!',
      message: 'You received ₦20,000 from Adaeze Okafor (@adaeze).',
      type: 'transaction',
      read: false,
      date: now
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_001',
      userId: adminId,
      userName: 'Oluwaseun Balogun',
      action: 'SYSTEM_BOOT',
      details: 'KudiFlow production services initialized with banking modules.',
      ip: '102.89.34.12',
      timestamp: oneWeekAgo,
      severity: 'info'
    },
    {
      id: 'aud_002',
      userId: adaezeId,
      userName: 'Adaeze Okafor',
      action: 'P2P_TRANSFER',
      details: 'Transferred ₦20,000 to @tunde (Ref: KDF-20261001-981244) with PIN authorization.',
      ip: '105.112.98.54',
      timestamp: now,
      severity: 'info'
    }
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: 'tkt_001',
      userId: adaezeId,
      userName: 'Adaeze Okafor',
      userEmail: 'adaeze@kudiflow.ng',
      subject: 'Inquiry on increased daily transfer limit',
      description: 'Hello KudiFlow team, how can I upgrade my Tier 2 account to Tier 3 to send up to ₦5,000,000 daily?',
      category: 'account',
      status: 'open',
      createdAt: yesterday
    }
  ];

  return { users, transactions, budgets, savings, notifications, auditLogs, supportTickets };
}

// Read database
function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database, creating fresh copy', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

// Write database
function writeDB(data: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Middleware
app.use(express.json());

// Auth helper middleware
function getUserFromToken(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;

  const db = readDB();
  // We use user ID as simple auth bearer token for seamless session persistence
  return db.users.find(u => u.id === token) || null;
}

// API Routes

// 1. Auth routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, pin } = req.body;
  if (!name || !email || !phone || !password || !pin) {
    res.status(400).json({ error: 'All fields (name, email, phone, password, 4-digit PIN) are required.' });
    return;
  }

  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    res.status(400).json({ error: 'Transaction PIN must be exactly 4 numeric digits.' });
    return;
  }

  const db = readDB();
  const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const existingPhone = db.users.find(u => u.phone === phone);
  if (existingPhone) {
    res.status(400).json({ error: 'An account with this phone number already exists.' });
    return;
  }

  const tagCandidate = '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  let finalTag = tagCandidate;
  let tagSuffix = 1;
  while (db.users.some(u => u.kudiTag.toLowerCase() === finalTag.toLowerCase())) {
    finalTag = `${tagCandidate}${tagSuffix++}`;
  }

  const newUser: User = {
    id: 'usr_' + crypto.randomBytes(6).toString('hex'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    kudiTag: finalTag,
    passwordHash: hashPassword(password),
    pinHash: hashPin(pin),
    accountNumber: generateNuban(),
    bankName: 'Providus Bank / KudiFlow',
    balance: 50000, // Welcome signup bonus credit of ₦50,000 for immediate testing!
    role: email.toLowerCase() === 'shopatstylestessentials@gmail.com' ? 'admin' : 'user',
    status: 'active',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669&textColor=ffffff`,
    biometricsEnabled: false,
    twoFactorEnabled: false,
    notificationPrefs: { email: true, push: true, sms: true, budgetAlerts: true },
    createdAt: new Date().toISOString()
  };

  // Welcome transaction
  const welcomeTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: generateRef('KDF-WELCOME'),
    userId: newUser.id,
    type: 'deposit',
    amount: 50000,
    category: 'Income',
    description: 'Welcome Account Activation Bonus',
    counterparty: 'KudiFlow Central Reserve',
    status: 'successful',
    date: new Date().toISOString(),
    notes: 'Welcome to KudiFlow! Enjoy seamless Naira management.'
  };

  const welcomeNotif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: newUser.id,
    title: 'Welcome to KudiFlow! 🎉',
    message: `Account activated successfully. Your virtual account number is ${newUser.accountNumber} (Providus Bank). ₦50,000 starter credit added to your wallet.`,
    type: 'system',
    read: false,
    date: new Date().toISOString()
  };

  const log: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: newUser.id,
    userName: newUser.name,
    action: 'USER_REGISTER',
    details: `User registered with email ${newUser.email}, phone ${newUser.phone}, NUBAN ${newUser.accountNumber}.`,
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'info'
  };

  db.users.push(newUser);
  db.transactions.push(welcomeTx);
  db.notifications.push(welcomeNotif);
  db.auditLogs.push(log);
  writeDB(db);

  // Exclude sensitive hashes
  const { passwordHash, pinHash, ...safeUser } = newUser;
  res.json({
    token: newUser.id,
    user: safeUser
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ error: 'Please enter your email or phone number and password.' });
    return;
  }

  const db = readDB();
  const trimmed = identifier.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === trimmed || u.phone === trimmed || u.kudiTag.toLowerCase() === trimmed);

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. User not found.' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'Your KudiFlow account is suspended. Please contact compliance@kudiflow.ng.' });
    return;
  }

  const pHash = hashPassword(password);
  if (user.passwordHash !== pHash) {
    res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    return;
  }

  const log: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    userName: user.name,
    action: 'USER_LOGIN',
    details: `User logged in from ${req.ip || 'client'}.`,
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'info'
  };
  db.auditLogs.push(log);
  writeDB(db);

  const { passwordHash, pinHash, ...safeUser } = user;
  res.json({
    token: user.id,
    user: safeUser
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }
  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    res.status(404).json({ error: 'No user registered with this email address.' });
    return;
  }

  user.passwordHash = hashPassword(newPassword);

  const log: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    userName: user.name,
    action: 'PASSWORD_RESET',
    details: 'User successfully updated password via reset flow.',
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'warning'
  };
  db.auditLogs.push(log);
  writeDB(db);

  res.json({ message: 'Password reset successfully. You can now log in.' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return;
  }
  const { passwordHash, pinHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 2. Wallet & Financial Overview
app.get('/api/wallet/summary', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  const userTx = db.transactions.filter(t => t.userId === user.id && t.status === 'successful');
  const userSavings = db.savings.filter(s => s.userId === user.id);
  const totalSavings = userSavings.reduce((acc, s) => acc + s.currentAmount, 0);

  // Income: transfer_in, deposit, manual income
  const totalIncome = userTx
    .filter(t => t.type === 'deposit' || t.type === 'transfer_in' || t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  // Expenses: transfer_out, withdrawal, bill_payment, manual expense, savings_deposit
  const totalExpenses = userTx
    .filter(t => t.type === 'transfer_out' || t.type === 'withdrawal' || t.type === 'bill_payment' || t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Monthly spending summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = userTx
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear &&
        (t.type === 'transfer_out' || t.type === 'withdrawal' || t.type === 'bill_payment' || t.type === 'expense');
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyIncome = userTx
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear &&
        (t.type === 'deposit' || t.type === 'transfer_in' || t.type === 'income');
    })
    .reduce((acc, t) => acc + t.amount, 0);

  res.json({
    balance: user.balance,
    totalIncome,
    totalExpenses,
    totalSavings,
    monthlyIncome,
    monthlyExpenses,
    accountNumber: user.accountNumber,
    bankName: user.bankName,
    kudiTag: user.kudiTag
  });
});

// Resolve recipient for P2P transfer
app.post('/api/wallet/resolve-recipient', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Recipient identifier required.' });
    return;
  }

  const trimmed = query.trim().toLowerCase();
  const db = readDB();
  const recipient = db.users.find(u =>
    (u.kudiTag.toLowerCase() === trimmed ||
    u.email.toLowerCase() === trimmed ||
    u.phone === trimmed ||
    u.accountNumber === trimmed) &&
    u.id !== user.id
  );

  if (!recipient) {
    res.status(404).json({ error: 'No KudiFlow user found with that Tag, Email, Phone, or Account Number.' });
    return;
  }

  res.json({
    id: recipient.id,
    name: recipient.name,
    kudiTag: recipient.kudiTag,
    accountNumber: recipient.accountNumber,
    bankName: recipient.bankName,
    avatar: recipient.avatar
  });
});

// Add money (Deposit)
app.post('/api/wallet/deposit', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { amount, method } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    res.status(400).json({ error: 'Please enter a valid deposit amount.' });
    return;
  }

  if (numAmount < 100) {
    res.status(400).json({ error: 'Minimum deposit is ₦100.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  currentUser.balance += numAmount;

  const newTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: generateRef('KDF-DEP'),
    userId: currentUser.id,
    type: 'deposit',
    amount: numAmount,
    category: 'Income',
    description: `Wallet top-up via ${method || 'Card / Instant Bank Transfer'}`,
    counterparty: 'Nigerian Interbank Settlement System (NIBSS)',
    status: 'successful',
    date: new Date().toISOString(),
    metadata: { method: method || 'Instant Inflow' }
  };

  const notif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    title: 'Wallet Funded Successfully',
    message: `₦${numAmount.toLocaleString()} has been credited to your wallet via ${method || 'Deposit'}.`,
    type: 'transaction',
    read: false,
    date: new Date().toISOString()
  };

  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'WALLET_DEPOSIT',
    details: `Deposited ₦${numAmount} via ${method || 'Card/Transfer'}. Ref: ${newTx.reference}.`,
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'info'
  };

  db.transactions.unshift(newTx);
  db.notifications.unshift(notif);
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({
    message: 'Deposit successful!',
    newBalance: currentUser.balance,
    transaction: newTx
  });
});

// Send money to another user (P2P Transfer)
app.post('/api/wallet/transfer', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { recipientId, amount, pin, note } = req.body;
  const numAmount = Number(amount);

  if (!recipientId || !numAmount || numAmount <= 0 || !pin) {
    res.status(400).json({ error: 'Recipient, positive amount, and 4-digit PIN are required.' });
    return;
  }

  if (recipientId === user.id) {
    res.status(400).json({ error: 'You cannot transfer funds to yourself.' });
    return;
  }

  const db = readDB();
  const sender = db.users.find(u => u.id === user.id);
  const recipient = db.users.find(u => u.id === recipientId);

  if (!sender) {
    res.status(404).json({ error: 'Sender not found.' });
    return;
  }
  if (!recipient) {
    res.status(404).json({ error: 'Recipient not found on KudiFlow.' });
    return;
  }

  if (recipient.status === 'suspended') {
    res.status(400).json({ error: 'Recipient account is suspended and cannot receive funds.' });
    return;
  }

  // Verify PIN
  const pHash = hashPin(pin);
  if (sender.pinHash !== pHash) {
    res.status(400).json({ error: 'Incorrect 4-digit transaction PIN. Transfer denied.' });
    return;
  }

  // Check sufficient funds
  if (sender.balance < numAmount) {
    res.status(400).json({ error: `Insufficient funds. Your balance is ₦${sender.balance.toLocaleString()}.` });
    return;
  }

  // Atomically update balances
  sender.balance -= numAmount;
  recipient.balance += numAmount;

  const ref = generateRef('KDF-TRF');
  const now = new Date().toISOString();

  // Transaction for sender
  const senderTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: ref,
    userId: sender.id,
    type: 'transfer_out',
    amount: numAmount,
    category: 'Other',
    description: `Transfer to ${recipient.name} (${recipient.kudiTag})`,
    counterparty: `${recipient.name} (${recipient.kudiTag})`,
    status: 'successful',
    date: now,
    notes: note || undefined,
    metadata: {
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientTag: recipient.kudiTag,
      recipientAccount: recipient.accountNumber
    }
  };

  // Transaction for recipient
  const recipientTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: ref,
    userId: recipient.id,
    type: 'transfer_in',
    amount: numAmount,
    category: 'Income',
    description: `Money received from ${sender.name} (${sender.kudiTag})`,
    counterparty: `${sender.name} (${sender.kudiTag})`,
    status: 'successful',
    date: now,
    notes: note || undefined,
    metadata: {
      senderId: sender.id,
      senderName: sender.name,
      senderTag: sender.kudiTag
    }
  };

  // Notifications
  const senderNotif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: sender.id,
    title: 'Transfer Sent Successfully',
    message: `You transferred ₦${numAmount.toLocaleString()} to ${recipient.name} (${recipient.kudiTag}).`,
    type: 'transaction',
    read: false,
    date: now
  };

  const recipientNotif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: recipient.id,
    title: 'Money Received! 💰',
    message: `You received ₦${numAmount.toLocaleString()} from ${sender.name} (${sender.kudiTag}).`,
    type: 'transaction',
    read: false,
    date: now
  };

  // Audit log
  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: sender.id,
    userName: sender.name,
    action: 'P2P_TRANSFER',
    details: `Transferred ₦${numAmount} to ${recipient.name} (ID: ${recipient.id}). Ref: ${ref}`,
    ip: req.ip || '127.0.0.1',
    timestamp: now,
    severity: 'info'
  };

  db.transactions.unshift(senderTx);
  db.transactions.unshift(recipientTx);
  db.notifications.unshift(senderNotif);
  db.notifications.unshift(recipientNotif);
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({
    message: 'Transfer completed successfully!',
    reference: ref,
    newBalance: sender.balance,
    transaction: senderTx
  });
});

// Withdraw money to Commercial Nigerian Bank
app.post('/api/wallet/withdraw', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { bankName, accountNumber, accountName, amount, pin } = req.body;
  const numAmount = Number(amount);

  if (!bankName || !accountNumber || !numAmount || numAmount <= 0 || !pin) {
    res.status(400).json({ error: 'Bank, account number, amount, and PIN are required.' });
    return;
  }

  if (accountNumber.length !== 10 || !/^\d{10}$/.test(accountNumber)) {
    res.status(400).json({ error: 'Nigerian NUBAN account number must be 10 numeric digits.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const pHash = hashPin(pin);
  if (currentUser.pinHash !== pHash) {
    res.status(400).json({ error: 'Incorrect 4-digit transaction PIN.' });
    return;
  }

  const transferFee = 10; // ₦10 NIP fee
  const totalDeduction = numAmount + transferFee;

  if (currentUser.balance < totalDeduction) {
    res.status(400).json({ error: `Insufficient funds. Total required: ₦${totalDeduction.toLocaleString()} (including ₦10 NIP transfer fee). Current balance: ₦${currentUser.balance.toLocaleString()}.` });
    return;
  }

  currentUser.balance -= totalDeduction;
  const ref = generateRef('KDF-WTH');
  const now = new Date().toISOString();

  const withdrawalTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: ref,
    userId: currentUser.id,
    type: 'withdrawal',
    amount: numAmount,
    category: 'Other',
    description: `Bank Withdrawal to ${bankName} (${accountNumber})`,
    counterparty: `${accountName || 'Beneficiary'} - ${bankName} (${accountNumber})`,
    status: 'successful',
    date: now,
    metadata: {
      bankName,
      accountNumber,
      accountName: accountName || currentUser.name,
      fee: transferFee
    }
  };

  const notif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    title: 'Bank Withdrawal Successful',
    message: `₦${numAmount.toLocaleString()} dispatched to ${bankName} account ${accountNumber}. Ref: ${ref}`,
    type: 'transaction',
    read: false,
    date: now
  };

  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'BANK_WITHDRAWAL',
    details: `Withdrawal of ₦${numAmount} to ${bankName} (${accountNumber}). Ref: ${ref}`,
    ip: req.ip || '127.0.0.1',
    timestamp: now,
    severity: 'info'
  };

  db.transactions.unshift(withdrawalTx);
  db.notifications.unshift(notif);
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({
    message: 'Withdrawal processed successfully to bank!',
    reference: ref,
    newBalance: currentUser.balance,
    transaction: withdrawalTx
  });
});

// Pay Nigerian Utility Bills (Airtime, Data, Electricity, Cable TV, Internet)
app.post('/api/bills/pay', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { billType, provider, customerId, packagePlan, amount, pin } = req.body;
  const numAmount = Number(amount);

  if (!billType || !provider || !customerId || !numAmount || numAmount <= 0 || !pin) {
    res.status(400).json({ error: 'Bill type, provider, customer/meter ID, amount, and PIN are required.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const pHash = hashPin(pin);
  if (currentUser.pinHash !== pHash) {
    res.status(400).json({ error: 'Incorrect 4-digit transaction PIN.' });
    return;
  }

  if (currentUser.balance < numAmount) {
    res.status(400).json({ error: `Insufficient balance for this bill payment. Required: ₦${numAmount.toLocaleString()}, Available: ₦${currentUser.balance.toLocaleString()}.` });
    return;
  }

  currentUser.balance -= numAmount;
  const ref = generateRef('KDF-BILL');
  const now = new Date().toISOString();

  let generatedToken: string | undefined;
  let tokenUnits: string | undefined;

  if (billType === 'electricity') {
    // Generate realistic 20-digit standard Nigerian prepaid token
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    const part4 = Math.floor(1000 + Math.random() * 9000);
    const part5 = Math.floor(1000 + Math.random() * 9000);
    generatedToken = `${part1}-${part2}-${part3}-${part4}-${part5}`;
    tokenUnits = (numAmount / 120).toFixed(1) + ' kWh';
  }

  const billTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: ref,
    userId: currentUser.id,
    type: 'bill_payment',
    amount: numAmount,
    category: 'Bills',
    description: `${provider} ${packagePlan || billType.toUpperCase()} Payment (${customerId})`,
    counterparty: `${provider} Utilities`,
    status: 'successful',
    date: now,
    metadata: {
      billType,
      provider,
      customerId,
      packagePlan,
      tokenCode: generatedToken,
      units: tokenUnits
    }
  };

  const notif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    title: `${provider} Bill Paid`,
    message: generatedToken
      ? `Payment of ₦${numAmount.toLocaleString()} successful! Token: ${generatedToken} (${tokenUnits})`
      : `Payment of ₦${numAmount.toLocaleString()} for ${provider} (${customerId}) was successful.`,
    type: 'transaction',
    read: false,
    date: now
  };

  // Check if this exceeds budget
  const userBudgets = db.budgets.filter(b => b.userId === currentUser.id && b.category === 'Bills');
  for (const b of userBudgets) {
    const currentBillsSpent = db.transactions
      .filter(t => t.userId === currentUser.id && t.category === 'Bills' && t.status === 'successful')
      .reduce((sum, t) => sum + t.amount, 0) + numAmount;

    if (currentBillsSpent >= b.limit) {
      db.notifications.unshift({
        id: 'notif_' + crypto.randomBytes(6).toString('hex'),
        userId: currentUser.id,
        title: '⚠️ Budget Limit Exceeded: Bills',
        message: `You have spent ₦${currentBillsSpent.toLocaleString()} on Bills, exceeding your budget limit of ₦${b.limit.toLocaleString()}.`,
        type: 'budget',
        read: false,
        date: now
      });
    } else if (currentBillsSpent >= b.limit * (b.alertThreshold / 100)) {
      db.notifications.unshift({
        id: 'notif_' + crypto.randomBytes(6).toString('hex'),
        userId: currentUser.id,
        title: 'Budget Alert: Bills',
        message: `You have reached ${((currentBillsSpent / b.limit) * 100).toFixed(0)}% of your monthly Bills budget.`,
        type: 'budget',
        read: false,
        date: now
      });
    }
  }

  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'BILL_PAYMENT',
    details: `Paid ${provider} bill ₦${numAmount} for ${customerId}. Ref: ${ref}`,
    ip: req.ip || '127.0.0.1',
    timestamp: now,
    severity: 'info'
  };

  db.transactions.unshift(billTx);
  db.notifications.unshift(notif);
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({
    message: 'Bill payment successful!',
    reference: ref,
    newBalance: currentUser.balance,
    token: generatedToken,
    units: tokenUnits,
    transaction: billTx
  });
});

// 3. Transactions Listing & Filtering
app.get('/api/transactions', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { search, category, type, status, startDate, endDate } = req.query;
  const db = readDB();

  let list = db.transactions.filter(t => t.userId === user.id);

  if (category && category !== 'All') {
    list = list.filter(t => t.category === category);
  }

  if (type && type !== 'All') {
    list = list.filter(t => t.type === type);
  }

  if (status && status !== 'All') {
    list = list.filter(t => t.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.counterparty.toLowerCase().includes(q) ||
      t.reference.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  }

  if (startDate) {
    list = list.filter(t => new Date(t.date) >= new Date(String(startDate)));
  }

  if (endDate) {
    const end = new Date(String(endDate));
    end.setHours(23, 59, 59, 999);
    list = list.filter(t => new Date(t.date) <= end);
  }

  // Sort descending by date
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ transactions: list });
});

app.get('/api/transactions/:id', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  const tx = db.transactions.find(t => t.id === req.params.id && (t.userId === user.id || user.role === 'admin'));
  if (!tx) {
    res.status(404).json({ error: 'Transaction record not found.' });
    return;
  }

  res.json({ transaction: tx });
});

// Manual record income or expense
app.post('/api/transactions/manual', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { type, amount, category, date, description, notes, affectsBalance } = req.body;
  const numAmount = Number(amount);

  if (!type || !numAmount || numAmount <= 0 || !category || !description) {
    res.status(400).json({ error: 'Type, amount, category, and description are required.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const now = date ? new Date(date).toISOString() : new Date().toISOString();
  const ref = generateRef(type === 'income' ? 'KDF-INC' : 'KDF-EXP');

  // If user opts to affect wallet balance
  if (affectsBalance) {
    if (type === 'expense') {
      if (currentUser.balance < numAmount) {
        res.status(400).json({ error: 'Insufficient wallet balance to deduct this expense.' });
        return;
      }
      currentUser.balance -= numAmount;
    } else {
      currentUser.balance += numAmount;
    }
  }

  const newTx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: ref,
    userId: currentUser.id,
    type: type === 'income' ? 'income' : 'expense',
    amount: numAmount,
    category,
    description: description.trim(),
    counterparty: type === 'income' ? 'Manual Income Entry' : 'Manual Expense Entry',
    status: 'successful',
    date: now,
    notes: notes?.trim(),
    metadata: { manualRecord: true, affectsBalance: !!affectsBalance }
  };

  // Check budget warnings if expense
  if (type === 'expense') {
    const budget = db.budgets.find(b => b.userId === currentUser.id && b.category === category);
    if (budget) {
      const currentCategorySpent = db.transactions
        .filter(t => t.userId === currentUser.id && t.category === category && (t.type === 'expense' || t.type === 'bill_payment'))
        .reduce((acc, t) => acc + t.amount, 0) + numAmount;

      if (currentCategorySpent >= budget.limit) {
        db.notifications.unshift({
          id: 'notif_' + crypto.randomBytes(6).toString('hex'),
          userId: currentUser.id,
          title: `⚠️ Budget Exceeded: ${category}`,
          message: `Your total spending of ₦${currentCategorySpent.toLocaleString()} has exceeded your ${category} budget of ₦${budget.limit.toLocaleString()}.`,
          type: 'budget',
          read: false,
          date: new Date().toISOString()
        });
      } else if (currentCategorySpent >= budget.limit * (budget.alertThreshold / 100)) {
        db.notifications.unshift({
          id: 'notif_' + crypto.randomBytes(6).toString('hex'),
          userId: currentUser.id,
          title: `Budget Alert: ${category}`,
          message: `You've used ${((currentCategorySpent / budget.limit) * 100).toFixed(0)}% of your ${category} budget.`,
          type: 'budget',
          read: false,
          date: new Date().toISOString()
        });
      }
    }
  }

  db.transactions.unshift(newTx);
  writeDB(db);

  res.json({
    message: `${type === 'income' ? 'Income' : 'Expense'} recorded successfully!`,
    transaction: newTx,
    newBalance: currentUser.balance
  });
});

// 4. Budgets
app.get('/api/budgets', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  const userBudgets = db.budgets.filter(b => b.userId === user.id);

  // Calculate actual spent for each budget in current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const budgetsWithSpent = userBudgets.map(b => {
    const spent = db.transactions
      .filter(t => {
        if (t.userId !== user.id || t.status !== 'successful') return false;
        if (t.category !== b.category) return false;
        if (t.type !== 'expense' && t.type !== 'bill_payment' && t.type !== 'transfer_out') return false;
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const percentage = b.limit > 0 ? Math.min(100, (spent / b.limit) * 100) : 0;
    const isExceeded = spent > b.limit;
    const isNearLimit = spent >= b.limit * (b.alertThreshold / 100) && !isExceeded;

    return {
      ...b,
      spent,
      remaining: Math.max(0, b.limit - spent),
      percentage,
      isExceeded,
      isNearLimit
    };
  });

  res.json({ budgets: budgetsWithSpent });
});

app.post('/api/budgets', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { category, limit, period, alertThreshold } = req.body;
  const numLimit = Number(limit);

  if (!category || !numLimit || numLimit <= 0) {
    res.status(400).json({ error: 'Category and positive budget limit are required.' });
    return;
  }

  const db = readDB();
  // Check if budget for category already exists
  const existing = db.budgets.find(b => b.userId === user.id && b.category === category);
  if (existing) {
    existing.limit = numLimit;
    existing.alertThreshold = alertThreshold || 80;
    writeDB(db);
    res.json({ message: 'Budget updated successfully!', budget: existing });
    return;
  }

  const now = new Date();
  const newBudget: Budget = {
    id: 'bdg_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    category,
    limit: numLimit,
    period: period || 'monthly',
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
    alertThreshold: alertThreshold || 80
  };

  db.budgets.push(newBudget);
  writeDB(db);

  res.json({ message: 'Budget created successfully!', budget: newBudget });
});

app.delete('/api/budgets/:id', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  db.budgets = db.budgets.filter(b => b.id !== req.params.id || b.userId !== user.id);
  writeDB(db);
  res.json({ message: 'Budget removed.' });
});

// 5. Savings Goals
app.get('/api/savings', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  const goals = db.savings.filter(s => s.userId === user.id);
  const enriched = goals.map(g => ({
    ...g,
    progressPercentage: g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0
  }));

  res.json({ savings: enriched });
});

app.post('/api/savings', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { name, targetAmount, targetDate, category, initialDeposit, pin } = req.body;
  const numTarget = Number(targetAmount);

  if (!name || !numTarget || numTarget <= 0 || !targetDate) {
    res.status(400).json({ error: 'Goal name, target amount, and target date are required.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  let currentAmount = 0;
  const depositNum = Number(initialDeposit) || 0;

  if (depositNum > 0) {
    if (!pin) {
      res.status(400).json({ error: '4-digit transaction PIN required to fund this savings goal.' });
      return;
    }
    if (currentUser.pinHash !== hashPin(pin)) {
      res.status(400).json({ error: 'Incorrect 4-digit transaction PIN.' });
      return;
    }
    if (currentUser.balance < depositNum) {
      res.status(400).json({ error: 'Insufficient wallet balance for initial deposit.' });
      return;
    }

    currentUser.balance -= depositNum;
    currentAmount = depositNum;

    // Transaction
    db.transactions.unshift({
      id: 'tx_' + crypto.randomBytes(6).toString('hex'),
      reference: generateRef('KDF-SAV'),
      userId: currentUser.id,
      type: 'savings_deposit',
      amount: depositNum,
      category: 'Savings',
      description: `Savings Deposit to "${name}"`,
      counterparty: `Goal: ${name}`,
      status: 'successful',
      date: new Date().toISOString()
    });
  }

  const newGoal: SavingsGoal = {
    id: 'svg_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    name: name.trim(),
    targetAmount: numTarget,
    currentAmount,
    targetDate,
    category: category || 'Personal',
    isLocked: false,
    createdAt: new Date().toISOString()
  };

  db.savings.push(newGoal);
  writeDB(db);

  res.json({ message: 'Savings goal created!', goal: newGoal, newBalance: currentUser.balance });
});

// Deposit into existing savings goal
app.post('/api/savings/:id/deposit', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { amount, pin } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0 || !pin) {
    res.status(400).json({ error: 'Positive deposit amount and PIN required.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  const goal = db.savings.find(s => s.id === req.params.id && s.userId === user.id);

  if (!currentUser || !goal) {
    res.status(404).json({ error: 'Goal or user not found.' });
    return;
  }

  if (currentUser.pinHash !== hashPin(pin)) {
    res.status(400).json({ error: 'Incorrect 4-digit transaction PIN.' });
    return;
  }

  if (currentUser.balance < numAmount) {
    res.status(400).json({ error: `Insufficient wallet balance. You have ₦${currentUser.balance.toLocaleString()}.` });
    return;
  }

  currentUser.balance -= numAmount;
  goal.currentAmount += numAmount;

  const tx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: generateRef('KDF-SAV'),
    userId: currentUser.id,
    type: 'savings_deposit',
    amount: numAmount,
    category: 'Savings',
    description: `Deposit to Goal: "${goal.name}"`,
    counterparty: `KudiFlow Vault (${goal.name})`,
    status: 'successful',
    date: new Date().toISOString()
  };

  const notif: NotificationItem = {
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    title: 'Savings Goal Funded! 🎯',
    message: `₦${numAmount.toLocaleString()} added to "${goal.name}". Progress: ${((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%`,
    type: 'savings',
    read: false,
    date: new Date().toISOString()
  };

  db.transactions.unshift(tx);
  db.notifications.unshift(notif);
  writeDB(db);

  res.json({
    message: 'Successfully funded savings goal!',
    goal,
    newBalance: currentUser.balance
  });
});

// Withdraw from savings goal back to wallet
app.post('/api/savings/:id/withdraw', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { amount, pin } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0 || !pin) {
    res.status(400).json({ error: 'Amount and transaction PIN required.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  const goal = db.savings.find(s => s.id === req.params.id && s.userId === user.id);

  if (!currentUser || !goal) {
    res.status(404).json({ error: 'Goal or user not found.' });
    return;
  }

  if (currentUser.pinHash !== hashPin(pin)) {
    res.status(400).json({ error: 'Incorrect transaction PIN.' });
    return;
  }

  if (goal.currentAmount < numAmount) {
    res.status(400).json({ error: `Insufficient savings in this goal. Available: ₦${goal.currentAmount.toLocaleString()}.` });
    return;
  }

  goal.currentAmount -= numAmount;
  currentUser.balance += numAmount;

  const tx: Transaction = {
    id: 'tx_' + crypto.randomBytes(6).toString('hex'),
    reference: generateRef('KDF-WTHSAV'),
    userId: currentUser.id,
    type: 'savings_withdrawal',
    amount: numAmount,
    category: 'Income',
    description: `Withdrawal from Goal: "${goal.name}" to Wallet`,
    counterparty: `KudiFlow Vault (${goal.name})`,
    status: 'successful',
    date: new Date().toISOString()
  };

  db.transactions.unshift(tx);
  writeDB(db);

  res.json({
    message: 'Funds returned to main wallet!',
    goal,
    newBalance: currentUser.balance
  });
});

// 6. Analytics & Reports
app.get('/api/analytics', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  const userTx = db.transactions.filter(t => t.userId === user.id && t.status === 'successful');

  // Spending by category
  const categoryTotals: Record<string, number> = {
    Food: 0,
    Transportation: 0,
    Bills: 0,
    Shopping: 0,
    Entertainment: 0,
    Education: 0,
    Healthcare: 0,
    Other: 0
  };

  userTx.forEach(t => {
    if (t.type === 'expense' || t.type === 'bill_payment' || t.type === 'transfer_out') {
      const cat = t.category in categoryTotals ? t.category : 'Other';
      categoryTotals[cat] += t.amount;
    }
  });

  // Monthly trends (last 6 months)
  const monthlyTrends: { month: string; income: number; expenses: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const label = `${monthNames[m]} ${y.toString().slice(-2)}`;

    const inc = userTx
      .filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === m && txDate.getFullYear() === y &&
          (t.type === 'deposit' || t.type === 'transfer_in' || t.type === 'income');
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const exp = userTx
      .filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === m && txDate.getFullYear() === y &&
          (t.type === 'expense' || t.type === 'bill_payment' || t.type === 'transfer_out' || t.type === 'withdrawal');
      })
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyTrends.push({ month: label, income: inc, expenses: exp });
  }

  res.json({
    categoryBreakdown: categoryTotals,
    monthlyTrends
  });
});

// 7. Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  const list = db.notifications
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ notifications: list, unreadCount: list.filter(n => !n.read).length });
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  db.notifications.forEach(n => {
    if (n.userId === user.id) {
      n.read = true;
    }
  });
  writeDB(db);
  res.json({ message: 'All marked as read.' });
});

app.post('/api/notifications/clear', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const db = readDB();
  db.notifications = db.notifications.filter(n => n.userId !== user.id);
  writeDB(db);
  res.json({ message: 'Notifications cleared.' });
});

// 8. Profile & Settings
app.put('/api/profile', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { name, phone, avatar } = req.body;
  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (name) currentUser.name = name.trim();
  if (phone) currentUser.phone = phone.trim();
  if (avatar) currentUser.avatar = avatar.trim();

  writeDB(db);
  const { passwordHash, pinHash, ...safeUser } = currentUser;
  res.json({ message: 'Profile updated!', user: safeUser });
});

app.post('/api/profile/change-pin', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { oldPin, newPin } = req.body;
  if (!oldPin || !newPin) {
    res.status(400).json({ error: 'Current PIN and New PIN are required.' });
    return;
  }

  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    res.status(400).json({ error: 'New PIN must be exactly 4 numeric digits.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (currentUser.pinHash !== hashPin(oldPin)) {
    res.status(400).json({ error: 'Incorrect current PIN.' });
    return;
  }

  currentUser.pinHash = hashPin(newPin);

  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'PIN_CHANGED',
    details: 'User updated transaction PIN.',
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'warning'
  };
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({ message: 'Transaction PIN changed successfully.' });
});

app.post('/api/profile/change-password', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }

  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (currentUser.passwordHash !== hashPassword(currentPassword)) {
    res.status(400).json({ error: 'Incorrect current password.' });
    return;
  }

  currentUser.passwordHash = hashPassword(newPassword);

  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'PASSWORD_CHANGED',
    details: 'User changed account password.',
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'warning'
  };
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({ message: 'Password updated successfully.' });
});

app.put('/api/profile/settings', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { biometricsEnabled, twoFactorEnabled, notificationPrefs } = req.body;
  const db = readDB();
  const currentUser = db.users.find(u => u.id === user.id);
  if (!currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (typeof biometricsEnabled === 'boolean') currentUser.biometricsEnabled = biometricsEnabled;
  if (typeof twoFactorEnabled === 'boolean') currentUser.twoFactorEnabled = twoFactorEnabled;
  if (notificationPrefs) currentUser.notificationPrefs = { ...currentUser.notificationPrefs, ...notificationPrefs };

  writeDB(db);
  const { passwordHash, pinHash, ...safeUser } = currentUser;
  res.json({ message: 'Security preferences saved!', user: safeUser });
});

// 9. Support Tickets
app.post('/api/support/ticket', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { subject, description, category } = req.body;
  if (!subject || !description) {
    res.status(400).json({ error: 'Subject and description are required.' });
    return;
  }

  const db = readDB();
  const newTicket: SupportTicket = {
    id: 'tkt_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    subject: subject.trim(),
    description: description.trim(),
    category: category || 'general',
    status: 'open',
    createdAt: new Date().toISOString()
  };

  db.supportTickets.unshift(newTicket);
  writeDB(db);

  res.json({ message: 'Support ticket submitted. Reference: ' + newTicket.id, ticket: newTicket });
});

// 10. Admin Endpoints
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'active').length;
  const totalVolume = db.transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalTransactions = db.transactions.length;
  const openTickets = db.supportTickets.filter(t => t.status === 'open').length;
  const totalDeposits = db.users.reduce((acc, u) => acc + u.balance, 0);

  res.json({
    totalUsers,
    activeUsers,
    totalVolume,
    totalTransactions,
    openTickets,
    totalDeposits
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  // Safe user objects without passwordHash or pinHash
  const safeUsers = db.users.map(({ passwordHash, pinHash, ...u }) => u);
  res.json({ users: safeUsers });
});

app.post('/api/admin/users/:id/toggle-status', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (targetUser.id === user.id) {
    res.status(400).json({ error: 'You cannot suspend your own admin account.' });
    return;
  }

  targetUser.status = targetUser.status === 'active' ? 'suspended' : 'active';

  const audit: AuditLog = {
    id: 'aud_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    userName: user.name,
    action: 'ADMIN_USER_STATUS_CHANGE',
    details: `Admin ${user.name} changed status of ${targetUser.email} to ${targetUser.status}.`,
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
    severity: 'critical'
  };
  db.auditLogs.unshift(audit);
  writeDB(db);

  res.json({ message: `Account is now ${targetUser.status}.`, status: targetUser.status });
});

app.get('/api/admin/transactions', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  res.json({ transactions: db.transactions.slice(0, 100) });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  res.json({ auditLogs: db.auditLogs.slice(0, 100) });
});

app.get('/api/admin/tickets', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  res.json({ tickets: db.supportTickets });
});

app.post('/api/admin/tickets/:id/resolve', (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const db = readDB();
  const ticket = db.supportTickets.find(t => t.id === req.params.id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  ticket.status = 'resolved';
  writeDB(db);
  res.json({ message: 'Ticket marked as resolved.' });
});

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KudiFlow Naira Personal Finance Server listening on port ${PORT}`);
  });
}

startServer();
