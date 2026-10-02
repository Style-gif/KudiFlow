import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
  title?: string;
  subtitle?: string;
  amount?: number;
  recipientName?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Authorize Transaction',
  subtitle = 'Enter your 4-digit KudiFlow PIN to proceed',
  amount,
  recipientName
}) => {
  const { user } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const submitPin = async (finalPin: string) => {
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(finalPin);
      setPin('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Incorrect transaction PIN');
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!user?.biometricsEnabled) {
      setError('Biometric authentication is not enabled in your security settings.');
      return;
    }

    setIsBiometricScanning(true);
    setError('');

    // Simulate device biometric prompt (WebAuthn / TouchID)
    setTimeout(async () => {
      setIsBiometricScanning(false);
      // For demo accounts or configured PIN, use known PIN or prompt PIN
      try {
        const demoPins: Record<string, string> = {
          '@adaeze': '2580',
          '@tunde': '1122',
          '@seun_admin': '1234'
        };
        const resolvedPin = user?.kudiTag ? (demoPins[user.kudiTag] || '1234') : '1234';
        await submitPin(resolvedPin);
      } catch (e: any) {
        setError(e.message || 'Biometric verification failed.');
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>

          {amount !== undefined && (
            <div className="mt-3 py-2 px-3 bg-slate-50 rounded-lg inline-block border border-slate-100">
              <span className="text-xs text-slate-500">Amount: </span>
              <span className="text-sm font-bold text-emerald-700 tabular-nums">
                ₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
              {recipientName && (
                <span className="text-xs text-slate-600 block mt-0.5">To: {recipientName}</span>
              )}
            </div>
          )}
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full transition-all duration-150 ${
                pin.length > idx
                  ? 'bg-emerald-600 scale-110 shadow-sm shadow-emerald-200'
                  : 'bg-slate-200 border border-slate-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitting && (
          <div className="text-center text-xs text-emerald-700 py-2 font-medium animate-pulse">
            Verifying PIN and processing transaction...
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              disabled={isSubmitting || isBiometricScanning}
              className="h-12 rounded-xl bg-slate-50 text-lg font-semibold text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              {num}
            </button>
          ))}

          {/* Biometrics button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={isSubmitting || isBiometricScanning}
            title={user?.biometricsEnabled ? 'Use Biometrics' : 'Biometrics not enabled'}
            className={`h-12 rounded-xl flex items-center justify-center transition-colors ${
              user?.biometricsEnabled
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Fingerprint className={`h-6 w-6 ${isBiometricScanning ? 'animate-pulse text-emerald-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={isSubmitting || isBiometricScanning}
            className="h-12 rounded-xl bg-slate-50 text-lg font-semibold text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || isBiometricScanning || pin.length === 0}
            className="h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Demo default PIN: <span className="font-mono text-slate-600 font-semibold">{user?.kudiTag === '@tunde' ? '1122' : user?.kudiTag === '@seun_admin' ? '1234' : '2580'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
