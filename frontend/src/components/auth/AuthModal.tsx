import React, { useState } from "react";
import { AlertCircle, Loader2, Lock, Mail, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, user, isAuthenticated, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, fullName });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md text-slate-100">
      <div className="relative w-full max-w-md bg-navy-900 rounded-3xl shadow-2xl border border-navy-800 overflow-hidden">
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-6 relative border-b border-navy-800">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close sign-in dialog"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">FinSight AI</h3>
              <p className="text-xs text-slate-300">Sign in to access your private financial data</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-4">
          {errorMessage && (
            <div role="alert" className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="p-4 bg-navy-950/70 rounded-2xl border border-navy-800 space-y-2">
                <p className="text-sm font-bold text-slate-100">{user.fullName}</p>
                <p className="text-xs text-slate-300">{user.email}</p>
                <p className="text-xs text-slate-400">
                  Currency: {user.preferredCurrency} · Time zone: {user.timezone}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="w-full py-2.5 bg-navy-950 hover:bg-navy-850 border border-navy-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Sign out
                </button>
                <button
                  onClick={closeAuthModal}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex p-1 bg-navy-950 rounded-xl text-xs font-semibold border border-navy-800">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErrorMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg ${mode === "login" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setErrorMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg ${mode === "register" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "register" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1" htmlFor="auth-full-name">
                      Full name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="auth-full-name"
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1" htmlFor="auth-email">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1" htmlFor="auth-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      minLength={mode === "register" ? 8 : undefined}
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-navy-800 bg-navy-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{mode === "login" ? "Sign in" : "Create account"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
