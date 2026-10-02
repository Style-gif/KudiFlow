import {
  User,
  Transaction,
  Budget,
  SavingsGoal,
  NotificationItem,
  AuditLog,
  SupportTicket,
  WalletSummary,
  AnalyticsData,
  AdminStats
} from '../types';

const TOKEN_KEY = 'kudiflow_token';

export const apiClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred during request processing');
    }

    return data as T;
  },

  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    this.setToken(res.token);
    return res;
  },

  async register(payload: { name: string; email: string; phone: string; password: string; pin: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  },

  async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, confirmPassword })
    });
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  },

  // Wallet
  async getWalletSummary(): Promise<WalletSummary> {
    return this.request<WalletSummary>('/api/wallet/summary');
  },

  async resolveRecipient(query: string): Promise<{ id: string; name: string; kudiTag: string; accountNumber: string; bankName: string; avatar: string }> {
    return this.request('/api/wallet/resolve-recipient', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  async deposit(amount: number, method?: string): Promise<{ message: string; newBalance: number; transaction: Transaction }> {
    return this.request('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, method })
    });
  },

  async transfer(payload: { recipientId: string; amount: number; pin: string; note?: string }): Promise<{ message: string; reference: string; newBalance: number; transaction: Transaction }> {
    return this.request('/api/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async withdraw(payload: { bankName: string; accountNumber: string; accountName: string; amount: number; pin: string }): Promise<{ message: string; reference: string; newBalance: number; transaction: Transaction }> {
    return this.request('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Bills
  async payBill(payload: {
    billType: string;
    provider: string;
    customerId: string;
    packagePlan?: string;
    amount: number;
    pin: string;
  }): Promise<{ message: string; reference: string; newBalance: number; token?: string; units?: string; transaction: Transaction }> {
    return this.request('/api/bills/pay', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Transactions
  async getTransactions(params?: {
    search?: string;
    category?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ transactions: Transaction[] }>(`/api/transactions${qStr}`);
  },

  async getTransactionById(id: string): Promise<{ transaction: Transaction }> {
    return this.request<{ transaction: Transaction }>(`/api/transactions/${id}`);
  },

  async recordManualTransaction(payload: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    description: string;
    notes?: string;
    affectsBalance?: boolean;
  }): Promise<{ message: string; transaction: Transaction; newBalance: number }> {
    return this.request('/api/transactions/manual', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Budgets
  async getBudgets(): Promise<{ budgets: Budget[] }> {
    return this.request<{ budgets: Budget[] }>('/api/budgets');
  },

  async createBudget(payload: { category: string; limit: number; period?: string; alertThreshold?: number }): Promise<{ message: string; budget: Budget }> {
    return this.request('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async deleteBudget(id: string): Promise<{ message: string }> {
    return this.request(`/api/budgets/${id}`, {
      method: 'DELETE'
    });
  },

  // Savings
  async getSavings(): Promise<{ savings: SavingsGoal[] }> {
    return this.request<{ savings: SavingsGoal[] }>('/api/savings');
  },

  async createSavingsGoal(payload: {
    name: string;
    targetAmount: number;
    targetDate: string;
    category?: string;
    initialDeposit?: number;
    pin?: string;
  }): Promise<{ message: string; goal: SavingsGoal; newBalance: number }> {
    return this.request('/api/savings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async depositToGoal(id: string, amount: number, pin: string): Promise<{ message: string; goal: SavingsGoal; newBalance: number }> {
    return this.request(`/api/savings/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount, pin })
    });
  },

  async withdrawFromGoal(id: string, amount: number, pin: string): Promise<{ message: string; goal: SavingsGoal; newBalance: number }> {
    return this.request(`/api/savings/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount, pin })
    });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>('/api/analytics');
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return this.request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
  },

  async markNotificationsRead(): Promise<{ message: string }> {
    return this.request('/api/notifications/mark-read', { method: 'POST' });
  },

  async clearNotifications(): Promise<{ message: string }> {
    return this.request('/api/notifications/clear', { method: 'POST' });
  },

  // Profile & Settings
  async updateProfile(payload: { name?: string; phone?: string; avatar?: string }): Promise<{ message: string; user: User }> {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async changePin(oldPin: string, newPin: string): Promise<{ message: string }> {
    return this.request('/api/profile/change-pin', {
      method: 'POST',
      body: JSON.stringify({ oldPin, newPin })
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/api/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async updateSecuritySettings(payload: {
    biometricsEnabled?: boolean;
    twoFactorEnabled?: boolean;
    notificationPrefs?: Record<string, boolean>;
  }): Promise<{ message: string; user: User }> {
    return this.request('/api/profile/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // Support Ticket
  async submitTicket(payload: { subject: string; description: string; category?: string }): Promise<{ message: string; ticket: SupportTicket }> {
    return this.request('/api/support/ticket', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/api/admin/users');
  },

  async toggleUserStatus(id: string): Promise<{ message: string; status: 'active' | 'suspended' }> {
    return this.request(`/api/admin/users/${id}/toggle-status`, { method: 'POST' });
  },

  async getAdminTransactions(): Promise<{ transactions: Transaction[] }> {
    return this.request<{ transactions: Transaction[] }>('/api/admin/transactions');
  },

  async getAdminAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    return this.request<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs');
  },

  async getAdminTickets(): Promise<{ tickets: SupportTicket[] }> {
    return this.request<{ tickets: SupportTicket[] }>('/api/admin/tickets');
  },

  async resolveTicket(id: string): Promise<{ message: string }> {
    return this.request(`/api/admin/tickets/${id}/resolve`, { method: 'POST' });
  }
};
