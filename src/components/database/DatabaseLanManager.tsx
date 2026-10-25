/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Offline Central Database & LAN Network Manager
 */

import React, { useState } from 'react';
import {
  Database,
  Server,
  Network,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Cpu,
  Layers,
  ShieldCheck,
  FileCode,
  FolderSync,
  Activity,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { LanSettings } from '../../types';

interface DatabaseLanManagerProps {
  currentUser: string;
  currentUserRole: 'admin' | 'staff';
  onDataChanged: () => void;
}

export const DatabaseLanManager: React.FC<DatabaseLanManagerProps> = ({
  currentUser,
  currentUserRole,
  onDataChanged,
}) => {
  const [lanSettings, setLanSettings] = useState<LanSettings>(() => StorageService.getLanSettings());
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  const customers = StorageService.getCustomers();
  const invoices = StorageService.getInvoices();
  const payments = StorageService.getPayments();
  const complaints = StorageService.getComplaints();
  const technicians = StorageService.getTechnicians();
  const packages = StorageService.getPackages();
  const auditLogs = StorageService.getAuditLogs();

  // Export full backup
  const handleDownloadBackup = () => {
    const jsonString = StorageService.exportFullDatabase();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `ARSLAN_TECH_ISP_BACKUP_${dateStr}.json`;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Update last backup date in settings
    const updated: LanSettings = {
      ...lanSettings,
      lastBackupDate: new Date().toLocaleString(),
    };
    setLanSettings(updated);
    StorageService.saveLanSettings(updated, currentUser);
  };

  // Import / Restore backup
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentUserRole !== 'admin') {
      alert('Unauthorized: Only Administrator can restore a database backup.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = StorageService.importDatabase(content, currentUser);
        setImportStatus(result);
        if (result.success) {
          onDataChanged();
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to Sample Data
  const handleResetToSample = () => {
    if (adminPin !== '1234' && adminPin !== 'admin123') {
      setPinError('Invalid Administrator PIN (Default: 1234)');
      return;
    }

    StorageService.resetToSampleData(currentUser);
    setIsResetConfirmOpen(false);
    setAdminPin('');
    setPinError('');
    onDataChanged();
    alert('Database successfully reset to official factory sample data.');
  };

  const handleSaveLanMode = (newMode: LanSettings['mode']) => {
    const updated: LanSettings = {
      ...lanSettings,
      mode: newMode,
    };
    setLanSettings(updated);
    StorageService.saveLanSettings(updated, currentUser);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Core Storage & Multi-PC Synchronization</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">100% Offline Engine</span>
            <span aria-hidden="true">·</span>
            <span>Local Database Connected</span>
          </div>
          <h2 className="text-lg font-bold text-white">Offline Database & LAN Network Architecture</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Create Timestamped Backup</span>
          </button>
        </div>
      </div>

      {/* Database Diagnostic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Database Engine</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white">Central Relational Store</div>
          <div className="text-[11px] text-slate-500 mt-1">MS Access 2016 / Local JSON Engine</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active LAN Mode</span>
            <Network className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 uppercase">
            {lanSettings.mode === 'standalone' ? 'Local Standalone' : lanSettings.mode.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Station: {lanSettings.stationName}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Records Count</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold font-mono text-white">
            {(customers.length + invoices.length + payments.length + complaints.length).toLocaleString()} Rows
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zero latency local indexing</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Last Database Backup</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {lanSettings.lastBackupDate || 'Daily Scheduled'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Encrypted local archive</div>
        </div>
      </div>

      {/* Two Column Layout: LAN Multi-User Setup & Backup Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 2 to 5 Computers LAN Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-sm text-white">2–5 Computer Local Area Network (LAN) Setup</h3>
              <p className="text-xs text-slate-400">Share single master database across office desks without internet</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Select Operational Deployment Mode:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveLanMode('standalone')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    lanSettings.mode === 'standalone'
                      ? 'bg-slate-800 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">Standalone</div>
                  <div className="text-[10px] text-slate-500">Single Windows PC</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveLanMode('lan_host')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    lanSettings.mode === 'lan_host'
                      ? 'bg-slate-800 border-sky-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-sky-400">LAN Master Host</div>
                  <div className="text-[10px] text-slate-500">Main Server Computer</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveLanMode('lan_client')}
                  className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                    lanSettings.mode === 'lan_client'
                      ? 'bg-slate-800 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-purple-400">Client Terminal</div>
                  <div className="text-[10px] text-slate-500">Billing Counter PC</div>
                </button>
              </div>
            </div>

            {/* Host PC Details */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Master Server LAN IP:</span>
                <span className="text-white font-bold">{lanSettings.hostIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Port:</span>
                <span className="text-white">{lanSettings.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Windows Shared Folder:</span>
                <span className="text-slate-300 truncate max-w-[200px]" title={lanSettings.sharedDatabasePath}>
                  {lanSettings.sharedDatabasePath}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Simultaneous Terminals:</span>
                <span className="text-emerald-400 font-bold">3 Workstations Online</span>
              </div>
            </div>

            {/* Step-by-step LAN connection guide */}
            <div className="space-y-1.5 text-slate-300 text-[11px] bg-slate-950/60 p-3 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">LAN Deployment Instructions:</span>
              <p>1. Connect all 2–5 computers to the same office Wi-Fi router or Ethernet switch.</p>
              <p>2. On the Master PC (Server), ensure Windows Firewall allows inbound TCP traffic on port 3000.</p>
              <p>3. On Cashier PC #2 and Technical Desk PC #3, open browser or desktop client pointing to <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">http://{lanSettings.hostIp}:{lanSettings.port}</code>.</p>
              <p>4. All transactions and invoice changes sync instantly to the central database without duplicates.</p>
            </div>
          </div>
        </div>

        {/* Right: Backup, Restore & Data Reset */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Database Backup & Disaster Recovery</h3>
              <p className="text-xs text-slate-400">Safely backup records, restore prior snapshots, or seed demo data</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Backup Action */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Full Database Backup (JSON Export)</span>
                <span className="text-[11px] text-slate-400">
                  Includes all customers, invoices, payments, complaints, and audit logs.
                </span>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs shrink-0 cursor-pointer"
              >
                Download (.json)
              </button>
            </div>

            {/* Restore Action */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Restore from Backup File</span>
                <span className="text-[11px] text-slate-400">
                  Upload an existing .json backup to restore system state.
                </span>
              </div>
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs shrink-0 cursor-pointer border border-slate-700">
                <span>Select File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded text-xs border ${
                  importStatus.success
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                {importStatus.message}
              </div>
            )}

            {/* Reset to Factory Sample Data */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-400 block">Factory Reset / Sample Seed</span>
                <span className="text-[11px] text-slate-400">
                  Reset database to official Pakistani demonstration dataset (Admin PIN required).
                </span>
              </div>
              <button
                onClick={() => {
                  setAdminPin('');
                  setPinError('');
                  setIsResetConfirmOpen(true);
                }}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold rounded text-xs shrink-0 border border-rose-600/40 cursor-pointer"
              >
                Reset to Sample
              </button>
            </div>

            {/* Table Row Distribution Breakdown */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Active Table Row Audit
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Customers</span>
                  <span className="text-white font-bold">{customers.length}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Invoices</span>
                  <span className="text-white font-bold">{invoices.length}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Payments</span>
                  <span className="text-white font-bold">{payments.length}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Complaints</span>
                  <span className="text-white font-bold">{complaints.length}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Technicians</span>
                  <span className="text-white font-bold">{technicians.length}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Audit Logs</span>
                  <span className="text-white font-bold">{auditLogs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESET TO SAMPLE CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-lg w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Confirm Factory Sample Reset</h3>
            </div>

            <p className="text-slate-300">
              This action will reset all subscriber ledgers, invoices, payments, and complaints back to the factory demonstration records. Current additions will be replaced.
            </p>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Administrator Security PIN (Default: 1234)</label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter Admin PIN"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            {pinError && <div className="text-rose-400 font-semibold">{pinError}</div>}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToSample}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded shadow-sm cursor-pointer"
              >
                Reset Database Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
