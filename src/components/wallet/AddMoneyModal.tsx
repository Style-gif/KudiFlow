import React, { useState } from 'react';
import { X, PlusCircle, Copy, Check, CreditCard, Building2, Smartphone, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { formatNaira } from '../../utils/format';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [activeMethod, setActiveMethod] = useState<'transfer' | 'card' | 'ussd'>('transfer');
  const [copied, setCopied] = useState(false);
  const [cardAmount, setCardAmount] = useState('25000');
  const [cardNumber, setCardNumber] = useState('5399 4100 2891 0024');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('821');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (user?.accountNumber) {
      navigator.clipboard.writeText(user.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardDeposit = async () => {
    const num = Number(cardAmount);
    if (!num || num < 100) return;

    setIsProcessing(true);
    try {
      await apiClient.deposit(num, 'Debit Card (Mastercard)');
      await refreshUser();
      setSuccessMsg(`₦${num.toLocaleString()} deposited successfully!`);
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Deposit failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateBankTransfer = async () => {
    // Quick button to simulate an inbound NIP bank transfer from GTBank/Access
    setIsProcessing(true);
    try {
      await apiClient.deposit(50000, 'Direct Bank Inflow (GTBank NIP)');
      await refreshUser();
      setSuccessMsg('Inbound NIP transfer of ₦50,000 received!');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Add Money to Wallet</h3>
            <p className="text-xs text-slate-500">Fund your Naira balance instantly</p>
          </div>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setActiveMethod('transfer')}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMethod === 'transfer' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Bank Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod('card')}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMethod === 'card' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Debit Card</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod('ussd')}
            className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMethod === 'ussd' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>USSD</span>
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Method 1: Virtual Dedicated Bank Account */}
        {activeMethod === 'transfer' && (
          <div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
                  Personal Virtual NUBAN
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Active 24/7
                </span>
              </div>

              <div className="mb-3">
                <span className="text-xs text-slate-400 block mb-0.5">Account Number</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold tracking-wider text-white">
                    {user?.accountNumber || '9012345678'}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-emerald-300 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Bank Name</span>
                  <span className="font-semibold">{user?.bankName || 'Providus Bank'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Beneficiary Name</span>
                  <span className="font-semibold truncate block">{user?.name}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Transfer funds from any Nigerian mobile banking app (GTBank, Access, Zenith, Kuda, OPay, etc.) to the virtual account above. Your KudiFlow wallet will be credited automatically within seconds.
            </p>

            <button
              onClick={handleSimulateBankTransfer}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Simulating Inflow...' : '⚡ Test Inflow: Credit ₦50,000 Now'}
            </button>
          </div>
        )}

        {/* Method 2: Debit Card */}
        {activeMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount to Deposit (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
                <input
                  type="number"
                  value={cardAmount}
                  onChange={e => setCardAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry Date</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">CVV</label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value)}
                  maxLength={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={handleCardDeposit}
              disabled={isProcessing || !cardAmount || Number(cardAmount) <= 0}
              className="w-full h-11 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {isProcessing ? 'Processing 3D Secure...' : `Pay ${formatNaira(Number(cardAmount) || 0)}`}
            </button>
          </div>
        )}

        {/* Method 3: USSD */}
        {activeMethod === 'ussd' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-2">
              Dial your bank's USSD string on your registered mobile number to fund your KudiFlow account:
            </p>

            {[
              { bank: 'GTBank', code: `*737*2*${cardAmount}*${user?.accountNumber}#` },
              { bank: 'Zenith Bank', code: `*966*${cardAmount}*${user?.accountNumber}#` },
              { bank: 'Access Bank', code: `*901*1*${cardAmount}*${user?.accountNumber}#` },
              { bank: 'UBA', code: `*919*3*${user?.accountNumber}*${cardAmount}#` },
              { bank: 'First Bank', code: `*894*${cardAmount}*${user?.accountNumber}#` }
            ].map(u => (
              <div key={u.bank} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{u.bank}</span>
                  <span className="text-xs font-mono text-emerald-700 font-semibold">{u.code}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(u.code);
                    alert(`USSD string copied for ${u.bank}`);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-slate-700"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
