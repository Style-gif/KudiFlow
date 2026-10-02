import React from 'react';
import { Home, Wallet, ArrowLeftRight, PiggyBank, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'transactions', label: 'History', icon: ArrowLeftRight },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.4]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating mini bar for admin if user is admin */}
      {user?.role === 'admin' && activeTab !== 'admin' && (
        <div className="bg-emerald-900 text-white text-[10px] py-1 px-3 text-center flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Admin Access Available</span>
          <button
            onClick={() => setActiveTab('admin')}
            className="underline font-bold text-emerald-300 ml-1"
          >
            Open Console
          </button>
        </div>
      )}
    </div>
  );
};
