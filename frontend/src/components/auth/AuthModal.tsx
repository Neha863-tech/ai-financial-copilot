import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MessageSquare,
  KeyRound,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    requestOTP,
    verifyOTP,
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [otpTarget, setOtpTarget] = useState('');
  const [otpTargetType, setOtpTargetType] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await register({
        email,
        password,
        fullName,
        phone: phone || undefined,
        whatsappOptIn,
      });
      // Move to OTP verification for email
      setOtpTarget(email);
      setOtpTargetType('email');
      setMode('otp');
      setSuccessMsg(`Account created! A 6-digit OTP code has been dispatched to ${email}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await verifyOTP(otpTarget, otpCode, 'verification');
      setSuccessMsg('Verification confirmed! Your account is now verified.');
      setTimeout(() => {
        closeAuthModal();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await requestOTP(otpTarget, otpTargetType, 'verification');
      setSuccessMsg(`A new code was dispatched to ${otpTarget}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code. Please wait before retrying.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="relative w-full max-w-md bg-navy-900 rounded-3xl shadow-2xl border border-navy-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-6 relative border-b border-navy-800">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">TrustCart AI Security</h3>
              <p className="text-xs text-slate-300">
                {isAuthenticated
                  ? 'Manage your account and verification status'
                  : 'Customer OTP authentication & notifications'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Already Authenticated Profile Card */}
          {isAuthenticated && user && mode !== 'otp' && (
            <div className="space-y-4">
              <div className="p-4 bg-navy-950/70 rounded-2xl border border-navy-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{user.fullName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800/60 uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Email: {user.email}</span>
                    {user.isEmailVerified ? (
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          setOtpTarget(user.email);
                          setOtpTargetType('email');
                          setMode('otp');
                          await requestOTP(user.email, 'email', 'verification');
                        }}
                        className="text-violet-400 underline text-[11px]"
                      >
                        Verify Email
                      </button>
                    )}
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-between">
                      <span>Phone: {user.phone}</span>
                      {user.isPhoneVerified ? (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            setOtpTarget(user.phone!);
                            setOtpTargetType('phone');
                            setMode('otp');
                            await requestOTP(user.phone!, 'phone', 'verification');
                          }}
                          className="text-violet-400 underline text-[11px]"
                        >
                          Verify Phone
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-navy-800">
                    <span>WhatsApp Updates:</span>
                    <span className={user.whatsappOptIn ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {user.whatsappOptIn ? 'Enabled (Opted In)' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="w-full py-2.5 bg-navy-950 hover:bg-navy-850 border border-navy-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Log Out
                </button>
                <button
                  onClick={closeAuthModal}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-glow"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Mode: OTP Verification */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-violet-950/80 border border-violet-800/80 text-violet-400 flex items-center justify-center mx-auto shadow-glow">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">Enter Verification Code</h4>
                <p className="text-xs text-slate-400">
                  We sent a 6-digit cryptographic OTP to <span className="font-mono text-electric-400">{otpTarget}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center tracking-[10px] text-2xl font-mono py-3 rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-glow flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-electric-300" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Confirm Verification Code</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-violet-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCw className="w-3 h-3" /> Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-slate-400 hover:text-white hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Mode: Login or Register */}
          {!isAuthenticated && mode !== 'otp' && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 bg-navy-950 rounded-xl text-xs font-semibold border border-navy-800">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    mode === 'login' ? 'bg-violet-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    mode === 'register' ? 'bg-violet-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-glow flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-electric-300" /> : null}
                    <span>Sign In</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rohan Sharma"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rohan@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Mobile Number (for SMS & WhatsApp Tracking)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Password (min. 8 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={8}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp Opt-in Checkbox */}
                  <label className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/80 cursor-pointer text-left">
                    <input
                      type="checkbox"
                      checked={whatsappOptIn}
                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-[11px] text-emerald-300 leading-tight">
                      <span className="font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Updates Opt-In
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Receive real-time order confirmation, dispatch, and delivery notifications via Meta WhatsApp Business.
                      </span>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-glow flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-electric-300" /> : null}
                    <span>Create Account & Verify OTP</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
