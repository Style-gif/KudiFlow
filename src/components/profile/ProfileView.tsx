import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Fingerprint,
  Bell,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Check,
  Send,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { formatNaira } from '../../utils/format';

export const ProfileView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // PIN Change
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Security Preferences
  const [biometrics, setBiometrics] = useState(user?.biometricsEnabled ?? true);
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled ?? false);
  const [secMsg, setSecMsg] = useState('');

  // Support ticket
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDesc, setSupportDesc] = useState('');
  const [supportCategory, setSupportCategory] = useState('transaction');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg('');
    try {
      await apiClient.updateProfile({ name, phone });
      await refreshUser();
      setProfileMsg('Profile information updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinMsg('');

    if (newPin !== confirmPin) {
      setPinError('New PINs do not match.');
      return;
    }
    if (newPin.length !== 4) {
      setPinError('PIN must be 4 numeric digits.');
      return;
    }

    setIsChangingPin(true);
    try {
      await apiClient.changePin(oldPin, newPin);
      setPinMsg('Transaction PIN changed successfully.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinMsg(''), 3000);
    } catch (err: any) {
      setPinError(err.message || 'Incorrect old PIN');
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }

    setIsChangingPass(true);
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      setPassMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassMsg(''), 3000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggleSecurity = async (bio: boolean, tfa: boolean) => {
    setBiometrics(bio);
    setTwoFactor(tfa);
    try {
      await apiClient.updateSecuritySettings({
        biometricsEnabled: bio,
        twoFactorEnabled: tfa
      });
      await refreshUser();
      setSecMsg('Security preferences saved.');
      setTimeout(() => setSecMsg(''), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportDesc) return;

    setIsSubmittingTicket(true);
    try {
      const res = await apiClient.submitTicket({
        subject: supportSubject,
        description: supportDesc,
        category: supportCategory
      });
      setTicketSuccess(`Support inquiry logged (${res.ticket.id}). Our Lagos compliance team will respond.`);
      setSupportSubject('');
      setSupportDesc('');
      setTimeout(() => setTicketSuccess(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to submit inquiry');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900">
          Profile, Compliance & Security
        </h1>
        <p className="text-xs text-slate-500">
          Manage your verified Nigerian identity, transaction credentials, and banking limits.
        </p>
      </div>

      {/* Identity Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <img
          src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=KD'}
          alt={user?.name}
          className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-50 bg-slate-100 shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Tier 2 Verified
            </span>
            {user?.role === 'admin' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-white">
                Platform Admin
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 font-mono mb-3">
            {user?.email} · {user?.phone} · {user?.kudiTag}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block">Assigned NUBAN (CBN/NIBSS)</span>
              <span className="font-mono font-bold text-slate-900">{user?.accountNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Settlement Partner</span>
              <span className="font-semibold text-slate-800">{user?.bankName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Edit Profile & Security Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Update Personal Info */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Personal Details</h3>
          <p className="text-[11px] text-slate-400 mb-4">Update contact information on file</p>

          {profileMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (Nigeria)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors mt-2"
            >
              {isSavingProfile ? 'Saving...' : 'Update Profile Details'}
            </button>
          </form>
        </div>

        {/* 2. Security Toggles */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Security & Biometrics</h3>
          <p className="text-[11px] text-slate-400 mb-4">Authentication safeguards</p>

          {secMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{secMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-emerald-700 shadow-xs">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Biometric Authorization</h4>
                  <p className="text-[11px] text-slate-400">Use Face ID / Fingerprint for PIN prompt</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometrics}
                onChange={e => handleToggleSecurity(e.target.checked, twoFactor)}
                className="accent-emerald-600 h-5 w-5 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-emerald-700 shadow-xs">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Two-Factor Authentication</h4>
                  <p className="text-[11px] text-slate-400">Require OTP on unrecognized login</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={e => handleToggleSecurity(biometrics, e.target.checked)}
                className="accent-emerald-600 h-5 w-5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Change Transaction PIN */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Change 4-Digit Transaction PIN</h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">Required to send money, withdraw, and pay bills</p>

          {pinMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{pinMsg}</span>
            </div>
          )}
          {pinError && (
            <div className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current PIN</label>
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-center tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-center tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-center tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPin || !oldPin || newPin.length !== 4}
              className="w-full py-2 px-4 rounded-xl bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors mt-2"
            >
              {isChangingPin ? 'Updating PIN...' : 'Update Transaction PIN'}
            </button>
          </form>
        </div>

        {/* 4. Change Password */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">Ensure your account remains safe and secure</p>

          {passMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{passMsg}</span>
            </div>
          )}
          {passError && (
            <div className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass || !currentPassword || !newPassword}
              className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors mt-2"
            >
              {isChangingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Support & Issue Reporting */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Report an Issue or Contact Financial Support</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Direct communication line to KudiFlow support and dispute resolution desks.
        </p>

        {ticketSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{ticketSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmitTicket} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={supportSubject}
                onChange={e => setSupportSubject(e.target.value)}
                placeholder="e.g. Delayed NIP credit, Electricity token inquiry"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={supportCategory}
                onChange={e => setSupportCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="transaction">Transaction Dispute</option>
                <option value="account">Account Tier / Limit</option>
                <option value="bill">Utility Bill / Token</option>
                <option value="other">General Feedback</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Description</label>
            <textarea
              rows={3}
              value={supportDesc}
              onChange={e => setSupportDesc(e.target.value)}
              placeholder="Describe what occurred, including reference codes or timestamps if applicable..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingTicket || !supportSubject || !supportDesc}
            className="py-2.5 px-5 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit to Support</span>
          </button>
        </form>
      </div>
    </div>
  );
};
