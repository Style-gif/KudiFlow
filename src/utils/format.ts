export function formatNaira(amount: number, showDecimals = true): string {
  if (isNaN(amount)) return '₦0.00';
  return '₦' + amount.toLocaleString('en-NG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, Math.floor((now - then) / 1000));

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatShortDate(dateStr);
  } catch {
    return dateStr;
  }
}

export const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '057', name: 'Zenith Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '999992', name: 'OPay Digital Services' },
  { code: '999991', name: 'Palmpay' },
  { code: '50515', name: 'Moniepoint Microfinance Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '035', name: 'Wema Bank (ALAT)' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '076', name: 'Polaris Bank' }
];

export const UTILITY_PROVIDERS = {
  airtime: [
    { id: 'mtn', name: 'MTN Nigeria', icon: 'mtn' },
    { id: 'airtel', name: 'Airtel Nigeria', icon: 'airtel' },
    { id: 'glo', name: 'Glo Mobile', icon: 'glo' },
    { id: '9mobile', name: '9mobile', icon: '9mobile' }
  ],
  data: [
    {
      provider: 'MTN Nigeria',
      plans: [
        { id: 'mtn_1gb', name: '1GB / 30 Days', price: 1000 },
        { id: 'mtn_2_5gb', name: '2.5GB / 30 Days', price: 2000 },
        { id: 'mtn_5gb', name: '5GB / 30 Days', price: 3000 },
        { id: 'mtn_10gb', name: '10GB / 30 Days', price: 5000 },
        { id: 'mtn_20gb', name: '20GB / 30 Days', price: 9000 }
      ]
    },
    {
      provider: 'Airtel Nigeria',
      plans: [
        { id: 'airtel_1_5gb', name: '1.5GB / 30 Days', price: 1200 },
        { id: 'airtel_3gb', name: '3GB / 30 Days', price: 2200 },
        { id: 'airtel_6gb', name: '6GB / 30 Days', price: 3500 },
        { id: 'airtel_11gb', name: '11GB / 30 Days', price: 5500 }
      ]
    },
    {
      provider: 'Glo Mobile',
      plans: [
        { id: 'glo_2gb', name: '2GB / 30 Days', price: 1000 },
        { id: 'glo_5_8gb', name: '5.8GB / 30 Days', price: 2000 },
        { id: 'glo_10gb', name: '10GB / 30 Days', price: 3000 },
        { id: 'glo_18gb', name: '18GB / 30 Days', price: 5000 }
      ]
    },
    {
      provider: '9mobile',
      plans: [
        { id: '9mob_1_5gb', name: '1.5GB / 30 Days', price: 1200 },
        { id: '9mob_4_5gb', name: '4.5GB / 30 Days', price: 2500 },
        { id: '9mob_11gb', name: '11GB / 30 Days', price: 4000 }
      ]
    }
  ],
  electricity: [
    { id: 'ekedc', name: 'EKEDC - Eko Electricity Distribution (Lagos Island/South)' },
    { id: 'ikedc', name: 'IKEDC - Ikeja Electric (Lagos Mainland/Ikeja)' },
    { id: 'aedc', name: 'AEDC - Abuja Electricity Distribution' },
    { id: 'ibedc', name: 'IBEDC - Ibadan Electricity Distribution (Oyo, Ogun, Osun)' },
    { id: 'eedc', name: 'EEDC - Enugu Electricity Distribution (South East)' },
    { id: 'phed', name: 'PHED - Port Harcourt Electricity (Rivers, Bayelsa, Delta)' },
    { id: 'kaedco', name: 'KAEDCO - Kaduna Electric Distribution' }
  ],
  cable: [
    {
      provider: 'DSTV Nigeria',
      plans: [
        { id: 'dstv_padi', name: 'DSTV Padi', price: 4400 },
        { id: 'dstv_yanga', name: 'DSTV Yanga', price: 6000 },
        { id: 'dstv_confam', name: 'DSTV Confam', price: 11000 },
        { id: 'dstv_compact', name: 'DSTV Compact', price: 19000 },
        { id: 'dstv_compact_plus', name: 'DSTV Compact Plus', price: 30000 },
        { id: 'dstv_premium', name: 'DSTV Premium', price: 44000 }
      ]
    },
    {
      provider: 'GOTV Nigeria',
      plans: [
        { id: 'gotv_smallie', name: 'GOtv Smallie', price: 1900 },
        { id: 'gotv_jinja', name: 'GOtv Jinja', price: 3300 },
        { id: 'gotv_jolli', name: 'GOtv Jolli', price: 4850 },
        { id: 'gotv_max', name: 'GOtv Max', price: 7200 },
        { id: 'gotv_supa', name: 'GOtv Supa', price: 9600 }
      ]
    },
    {
      provider: 'StarTimes',
      plans: [
        { id: 'st_nova', name: 'Nova Bouquet', price: 1900 },
        { id: 'st_basic', name: 'Basic Bouquet', price: 3700 },
        { id: 'st_smart', name: 'Smart Bouquet', price: 4700 },
        { id: 'st_classic', name: 'Classic Bouquet', price: 5500 }
      ]
    }
  ],
  internet: [
    {
      provider: 'Spectranet 4G LTE',
      plans: [
        { id: 'spec_25gb', name: '25GB Unified Monthly', price: 12000 },
        { id: 'spec_50gb', name: '50GB Unified Monthly', price: 20000 },
        { id: 'spec_unlimited', name: 'Unlimited Monthly', price: 35000 }
      ]
    },
    {
      provider: 'Smile Communications',
      plans: [
        { id: 'smile_30gb', name: '30GB Bigga', price: 13500 },
        { id: 'smile_60gb', name: '60GB Bigga', price: 22000 }
      ]
    },
    {
      provider: 'Starlink Nigeria',
      plans: [
        { id: 'starlink_residential', name: 'Residential Standard Monthly Subscription', price: 53000 }
      ]
    }
  ]
};
