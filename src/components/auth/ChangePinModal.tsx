/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Change Security PIN Modal
 */

import React, { useState } from 'react';
import { Lock, X, Check } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { User } from '../../types';

interface ChangePinModalProps {
  user: User;
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ user, onClose }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentPin !== user.pin) {
      setError('Current PIN does not match.');
      return;
    }
    if (newPin.length < 4) {
      setError('New PIN must be at least 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and confirmation PIN do not match.');
      return;
    }

    StorageService.changeUserPin(user.id, newPin, user.username);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-sm shadow-2xl p-6 text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Change Security PIN</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded text-center space-y-1">
            <Check className="w-6 h-6 mx-auto text-emerald-400" />
            <div className="font-bold">Security PIN Updated!</div>
            <div className="text-[11px] text-slate-400">Closing window...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800">{error}</div>}

            <div>
              <label className="block text-slate-300 mb-1">Current PIN</label>
              <input
                type="password"
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">New PIN</label>
              <input
                type="password"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Confirm New PIN</label>
              <input
                type="password"
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded cursor-pointer"
              >
                Update PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
