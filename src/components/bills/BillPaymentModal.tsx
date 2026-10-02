import React, { useState } from 'react';
import { X, Zap, Wifi, Tv, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { formatNaira, UTILITY_PROVIDERS } from '../../utils/format';
import { PinModal } from '../common/PinModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { Transaction } from '../../types';

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: 'airtime' | 'data' | 'electricity' | 'cable' | 'internet';
}

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'airtime'
}) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'airtime' | 'data' | 'electricity' | 'cable' | 'internet'>(defaultTab);

  // Airtime
  const [airtimeNetwork, setAirtimeNetwork] = useState(UTILITY_PROVIDERS.airtime[0].name);
  const [airtimePhone, setAirtimePhone] = useState(user?.phone || '08012345678');
  const [airtimeAmount, setAirtimeAmount] = useState('2000');

  // Data
  const [dataNetwork, setDataNetwork] = useState(UTILITY_PROVIDERS.data[0].provider);
  const [dataPlan, setDataPlan] = useState(UTILITY_PROVIDERS.data[0].plans[0].id);
  const [dataPhone, setDataPhone] = useState(user?.phone || '08012345678');

  // Electricity
  const [disco, setDisco] = useState(UTILITY_PROVIDERS.electricity[0].name);
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [meterNumber, setMeterNumber] = useState('04218934512');
  const [electricAmount, setElectricAmount] = useState('10000');

  // Cable
  const [cableProvider, setCableProvider] = useState(UTILITY_PROVIDERS.cable[0].provider);
  const [cablePlan, setCablePlan] = useState(UTILITY_PROVIDERS.cable[0].plans[0].id);
  const [smartcard, setSmartcard] = useState('4128941029');

  // State
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  // Selected plan calculation
  const getSelectedDataPlan = () => {
    const net = UTILITY_PROVIDERS.data.find(d => d.provider === dataNetwork);
    return net?.plans.find(p => p.id === dataPlan) || net?.plans[0];
  };

  const getSelectedCablePlan = () => {
    const cab = UTILITY_PROVIDERS.cable.find(c => c.provider === cableProvider);
    return cab?.plans.find(p => p.id === cablePlan) || cab?.plans[0];
  };

  const calculateAmount = (): number => {
    if (activeTab === 'airtime') return Number(airtimeAmount) || 0;
    if (activeTab === 'data') return getSelectedDataPlan()?.price || 0;
    if (activeTab === 'electricity') return Number(electricAmount) || 0;
    if (activeTab === 'cable') return getSelectedCablePlan()?.price || 0;
    if (activeTab === 'internet') return 12000;
    return 0;
  };

  const handleProceed = () => {
    setError('');
    const amt = calculateAmount();
    if (amt <= 0) {
      setError('Please choose a valid plan or enter amount.');
      return;
    }
    if ((user?.balance || 0) < amt) {
      setError(`Insufficient balance. Required: ${formatNaira(amt)}, Available: ${formatNaira(user?.balance || 0)}.`);
      return;
    }

    if (activeTab === 'electricity' && (!meterNumber || meterNumber.length < 8)) {
      setError('Please enter a valid meter number.');
      return;
    }

    if (activeTab === 'cable' && (!smartcard || smartcard.length < 8)) {
      setError('Please enter a valid smartcard / IUC number.');
      return;
    }

    setIsPinOpen(true);
  };

  const handleAuthorizePayment = async (pin: string) => {
    const amt = calculateAmount();
    let providerName = '';
    let custId = '';
    let planDesc = '';

    if (activeTab === 'airtime') {
      providerName = airtimeNetwork;
      custId = airtimePhone;
      planDesc = 'Airtime Topup';
    } else if (activeTab === 'data') {
      providerName = dataNetwork;
      custId = dataPhone;
      planDesc = getSelectedDataPlan()?.name || 'Data Plan';
    } else if (activeTab === 'electricity') {
      providerName = disco.split('-')[0].trim();
      custId = meterNumber;
      planDesc = `${meterType.toUpperCase()} Electricity`;
    } else if (activeTab === 'cable') {
      providerName = cableProvider;
      custId = smartcard;
      planDesc = getSelectedCablePlan()?.name || 'Cable TV';
    } else {
      providerName = 'Spectranet 4G';
      custId = '08098765432';
      planDesc = '25GB Unified';
    }

    const res = await apiClient.payBill({
      billType: activeTab,
      provider: providerName,
      customerId: custId,
      packagePlan: planDesc,
      amount: amt,
      pin
    });

    await refreshUser();
    onSuccess();
    setCompletedTx(res.transaction);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Pay Nigerian Bills & Utilities</h3>
            <p className="text-xs text-slate-500">Airtime, Data, PHCN/DISCO Prepaid tokens, DSTV & GOTV</p>
          </div>

          {/* Bill category selector */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5 overflow-x-auto">
            {[
              { id: 'airtime', label: 'Airtime', icon: Phone },
              { id: 'data', label: 'Data', icon: Wifi },
              { id: 'electricity', label: 'Electricity', icon: Zap },
              { id: 'cable', label: 'Cable TV', icon: Tv }
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id as any);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === cat.id ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-xs">
            <span className="text-slate-500">Available Wallet Balance</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums">{formatNaira(user?.balance || 0)}</span>
          </div>

          {/* Form per category */}
          {activeTab === 'airtime' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Network</label>
                <div className="grid grid-cols-4 gap-2">
                  {UTILITY_PROVIDERS.airtime.map(net => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setAirtimeNetwork(net.name)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        airtimeNetwork === net.name
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {net.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={airtimePhone}
                  onChange={e => setAirtimePhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Airtime Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
                  <input
                    type="number"
                    value={airtimeAmount}
                    onChange={e => setAirtimeAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2000, 5000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAirtimeAmount(val.toString())}
                      className="px-2 py-0.5 text-[11px] rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono"
                    >
                      ₦{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Network</label>
                <select
                  value={dataNetwork}
                  onChange={e => {
                    setDataNetwork(e.target.value);
                    const net = UTILITY_PROVIDERS.data.find(d => d.provider === e.target.value);
                    if (net && net.plans.length > 0) {
                      setDataPlan(net.plans[0].id);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
                >
                  {UTILITY_PROVIDERS.data.map(d => (
                    <option key={d.provider} value={d.provider}>
                      {d.provider}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Data Bundle Plan</label>
                <select
                  value={dataPlan}
                  onChange={e => setDataPlan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
                >
                  {UTILITY_PROVIDERS.data
                    .find(d => d.provider === dataNetwork)
                    ?.plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₦{p.price.toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recipient Phone</label>
                <input
                  type="tel"
                  value={dataPhone}
                  onChange={e => setDataPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'electricity' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Electricity Disco</label>
                <select
                  value={disco}
                  onChange={e => setDisco(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
                >
                  {UTILITY_PROVIDERS.electricity.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={meterType === 'prepaid'}
                    onChange={() => setMeterType('prepaid')}
                    className="accent-emerald-600"
                  />
                  <span>Prepaid (Generates 20-digit token)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={meterType === 'postpaid'}
                    onChange={() => setMeterType('postpaid')}
                    className="accent-emerald-600"
                  />
                  <span>Postpaid</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meter Number</label>
                <input
                  type="text"
                  value={meterNumber}
                  onChange={e => setMeterNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 04218934512"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[11px] text-emerald-700 block mt-1 font-medium">
                  Verified Customer: MR. OLUWASEUN BALOGUN (Ikeja GRA)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recharge Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500 font-mono">₦</span>
                  <input
                    type="number"
                    value={electricAmount}
                    onChange={e => setElectricAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cable' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cable TV Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {UTILITY_PROVIDERS.cable.map(c => (
                    <button
                      key={c.provider}
                      type="button"
                      onClick={() => {
                        setCableProvider(c.provider);
                        setCablePlan(c.plans[0].id);
                      }}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                        cableProvider === c.provider
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {c.provider.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bouquet Package</label>
                <select
                  value={cablePlan}
                  onChange={e => setCablePlan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
                >
                  {UTILITY_PROVIDERS.cable
                    .find(c => c.provider === cableProvider)
                    ?.plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₦{p.price.toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Smartcard / IUC Number</label>
                <input
                  type="text"
                  value={smartcard}
                  onChange={e => setSmartcard(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4128941029"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="my-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Total Due</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatNaira(calculateAmount())}
              </span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              className="py-2.5 px-6 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <span>Authorize & Pay</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSubmit={handleAuthorizePayment}
        title="Authorize Bill Payment"
        subtitle={`Confirm payment of ${formatNaira(calculateAmount())}`}
        amount={calculateAmount()}
      />

      {completedTx && (
        <ReceiptModal
          transaction={completedTx}
          isOpen={true}
          onClose={() => {
            setCompletedTx(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
