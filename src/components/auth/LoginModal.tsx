/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - User Login & Authentication Screen
 */

import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
  isSessionExpired?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onClose,
  isSessionExpired,
}) => {
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = StorageService.loginUser(username.trim(), pin.trim());
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Invalid username or PIN. (Default Admin: admin / 1234, Staff: staff / 5678)');
    }
  };

  const handleQuickLogin = (uname: string, p: string) => {
    setUsername(uname);
    setPin(p);
    const user = StorageService.loginUser(uname, p);
    if (user) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">ARSLAN TECH SOLUTIONS ISP</h2>
          <p className="text-xs text-slate-400 mt-1">Billing & Complaints Management System v4.0</p>
          {isSessionExpired && (
            <div className="mt-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2 rounded">
              Your session was locked due to inactivity. Please log in again.
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded bg-rose-950/50 border border-rose-800 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Username / Operator ID</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or staff"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-9 text-white focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Access PIN / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-9 text-white font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Workstation</span>
          </button>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 block mb-2">Quick Demo Switch:</span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '1234')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px]"
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff', '5678')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px]"
              >
                Staff (Billing Only)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
