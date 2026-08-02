import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { api, ApiUser } from "../services/api";

interface LoginScreenProps {
  onLogin: (user: ApiUser, isNewAccount?: boolean) => void;
  onGuest: () => void;
  themeColor: string;
}

type AuthMode = "signin" | "signup" | "forgot" | "reset";

function getResetTokenFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("resetToken");
}

export default function LoginScreen({ onLogin, onGuest, themeColor }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>(() => (getResetTokenFromUrl() ? "reset" : "signin"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDevResetLink(null);

    if (mode === "reset") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      const token = getResetTokenFromUrl();
      if (!token) {
        setError("Missing reset token. Please use the link from your reset email.");
        return;
      }
      setLoading(true);
      try {
        await api.resetPassword(token, password);
        const { user } = await api.me();
        // Clean the token out of the URL bar before continuing.
        window.history.replaceState({}, "", window.location.pathname);
        onLogin(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reset your password.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "forgot") {
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      setLoading(true);
      try {
        const result = await api.forgotPassword(email);
        setSuccess(result.message);
        if (result.resetLink) {
          setDevResetLink(result.resetLink);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const { user } =
        mode === "signup" ? await api.signup(email, password, name.trim()) : await api.login(email, password);
      onLogin(user, mode === "signup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      <div
        className="absolute w-[450px] h-[450px] rounded-full filter blur-[100px] opacity-10 top-1/4 -left-1/4 -z-10 animate-pulse"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-[0.08] bottom-1/4 -right-1/4 -z-10"
        style={{ backgroundColor: themeColor }}
      />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/5"
            style={{ backgroundImage: `linear-gradient(135deg, ${themeColor}cc, ${themeColor})` }}
          >
            <GraduationCap className="w-9 h-9 text-white stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Academic Calculator</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">
            Calculate. Plan. Achieve.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleAction}
            className="space-y-4"
          >
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 text-center font-medium space-y-2">
                <p>{success}</p>
                {devResetLink && (
                  <div className="text-left bg-slate-950/60 rounded-lg p-2 border border-emerald-500/20">
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wide mb-1">
                      No email server configured — dev link
                    </p>
                    <a
                      href={devResetLink}
                      className="text-[11px] text-emerald-300 break-all underline"
                    >
                      {devResetLink}
                    </a>
                  </div>
                )}
              </div>
            )}

            {mode === "reset" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition"
                  />
                </div>
              </div>
            )}

            {(mode === "signin" || mode === "signup" || mode === "forgot") && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition"
                  />
                </div>
              </div>
            )}

            {(mode === "signin" || mode === "signup") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs font-medium focus:outline-none hover:underline"
                      style={{ color: themeColor }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 text-white shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer transition"
              style={{ backgroundColor: themeColor }}
            >
              <span>
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                  ? "Create Account"
                  : mode === "reset"
                  ? "Set New Password"
                  : "Send Reset Link"}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </motion.form>
        </AnimatePresence>

        {mode !== "reset" && (
          <div className="mt-8 space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="absolute bg-slate-900 px-3 text-xxs font-bold text-slate-500 uppercase tracking-widest">
                Or
              </span>
            </div>

            <button
              onClick={onGuest}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-950 hover:bg-slate-950/80 border border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-300 active:scale-[0.98] transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Continue as Guest (stored on this device only)</span>
            </button>

            <div className="text-center pt-2">
              {mode === "signin" && (
                <p className="text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: themeColor }}
                  >
                    Sign Up
                  </button>
                </p>
              )}
              {(mode === "signup" || mode === "forgot") && (
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="font-bold hover:underline"
                    style={{ color: themeColor }}
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
