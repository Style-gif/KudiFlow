import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { WalletView } from './components/wallet/WalletView';
import { BudgetView } from './components/budget/BudgetView';
import { SavingsView } from './components/savings/SavingsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { SendMoneyModal } from './components/wallet/SendMoneyModal';
import { AddMoneyModal } from './components/wallet/AddMoneyModal';
import { WithdrawModal } from './components/wallet/WithdrawModal';
import { BillPaymentModal } from './components/bills/BillPaymentModal';
import { RecordExpenseModal } from './components/expenses/RecordExpenseModal';
import { SavingsGoalModal } from './components/savings/SavingsGoalModal';
import { AuthModal } from './components/auth/AuthModal';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isPayBillsOpen, setIsPayBillsOpen] = useState(false);
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200 animate-pulse font-display">
          ₦
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-3 font-mono">Loading KudiFlow...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
      {/* Top Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenSend={() => setIsSendOpen(true)}
            onOpenAddMoney={() => setIsAddMoneyOpen(true)}
            onOpenPayBills={() => setIsPayBillsOpen(true)}
            onOpenRecordExpense={() => setIsRecordExpenseOpen(true)}
            onOpenNewGoal={() => setIsNewGoalOpen(true)}
            onNavigate={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            onOpenSend={() => setIsSendOpen(true)}
            onOpenAddMoney={() => setIsAddMoneyOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        )}

        {activeTab === 'budgets' && <BudgetView />}

        {activeTab === 'savings' && <SavingsView />}

        {activeTab === 'transactions' && <TransactionsView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'admin' && <AdminDashboardView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* In-App Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Action Modals */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSuccess={() => {}}
      />

      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={() => {}}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={() => {}}
      />

      <BillPaymentModal
        isOpen={isPayBillsOpen}
        onClose={() => setIsPayBillsOpen(false)}
        onSuccess={() => {}}
      />

      <RecordExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
        onSuccess={() => {}}
      />

      <SavingsGoalModal
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
        onSuccess={() => {}}
      />

      <AuthModal
        isOpen={isAuthModalOpen || !user}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
