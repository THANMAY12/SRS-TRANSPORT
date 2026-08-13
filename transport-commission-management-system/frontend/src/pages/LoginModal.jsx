import React, { useState } from "react";
import {
  Truck,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const LoginModal = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.login(username, password);
      login(res.token, res.user);
    } catch (err) {
      setErrorMsg(err.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = async (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.login(u, p);
      login(res.token, res.user);
    } catch (err) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950 via-slate-900 to-slate-950 opacity-90" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Transport Commission
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Private Access Portal for Admin & Workers
          </p>
        </div>

        {/* Quick Demo Credentials Presets */}
        <div className="p-3 bg-blue-50 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700/80 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider text-center">
            ⚡ Quick Test Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="login-preset-admin"
              onClick={() => handleQuickPreset("admin", "admin123")}
              className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Login Admin</span>
            </button>
            <button
              type="button"
              id="login-preset-worker"
              onClick={() => handleQuickPreset("worker", "worker123")}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login Worker</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="login-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>{isLoading ? "Authenticating..." : "Sign In to Portal"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-400">
            Protected Transport System &bull; Secure Session Encryption
          </p>
        </div>
      </div>
    </div>
  );
};
