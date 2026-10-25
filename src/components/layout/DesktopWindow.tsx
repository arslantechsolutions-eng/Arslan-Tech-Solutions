/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Windows Desktop Application Frame & Navigation
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Wrench,
  UserCheck,
  Wifi,
  BarChart3,
  Database,
  ShieldAlert,
  BookOpen,
  Minus,
  Square,
  X,
  LogOut,
  Lock,
  ChevronDown,
  Monitor,
  Printer,
  Plus,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { ActiveTab, User } from '../../types';

interface DesktopWindowProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: User;
  onLogout: () => void;
  onChangePin: () => void;
  onQuickAction: (action: string) => void;
  children: React.ReactNode;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  onChangePin,
  onQuickAction,
  children,
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Live Status Bar Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Keyboard Shortcuts (F1: Manual, F2: Bill, F3: Pay, F4: Ticket, F5: Refresh)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        onTabChange('manual_install');
      } else if (e.key === 'F2') {
        e.preventDefault();
        onQuickAction('generate_bill');
      } else if (e.key === 'F3') {
        e.preventDefault();
        onQuickAction('collect_payment');
      } else if (e.key === 'F4') {
        e.preventDefault();
        onQuickAction('new_complaint');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, onQuickAction]);

  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer Accounts', icon: Users },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    { id: 'complaints', label: 'Complaint Tickets', icon: Wrench },
    { id: 'technicians', label: 'Field Technicians', icon: UserCheck },
    { id: 'packages', label: 'Internet Packages', icon: Wifi },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'database_lan', label: 'Database & LAN', icon: Database },
    { id: 'audit_log', label: 'Security Audit Log', icon: ShieldAlert },
    { id: 'manual_install', label: 'Help & Manual (اردو)', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. Windows Native-Style Title Bar */}
      <div className="no-print h-9 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 text-xs shrink-0 select-none">
        {/* Left: Software Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            ATS
          </div>
          <span className="font-semibold text-slate-200 tracking-tight">
            ARSLAN TECH SOLUTIONS ISP
          </span>
          <span className="text-slate-500 text-[11px] font-mono">
            v4.0 Professional — [Windows Desktop Central Database]
          </span>
        </div>

        {/* Center: System Offline Indicator */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>100% Offline Central Engine</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-300">Station: BILLING-PC-01</span>
        </div>

        {/* Right: Windows Chrome Window Controls */}
        <div className="flex items-center -mr-3 h-full">
          <button
            onClick={() => {}}
            title="Minimize"
            className="h-full px-4 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title="Maximize / Restore"
            className="h-full px-4 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (confirm('Close ARSLAN TECH SOLUTIONS ISP Billing & Complaints software?')) {
                onLogout();
              }
            }}
            title="Exit / Lock Workstation"
            className="h-full px-4 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Desktop Menu Bar (File, Edit, Billing, Complaints, Tools, Help) */}
      <div className="no-print h-7 bg-slate-900/90 border-b border-slate-800/80 px-2 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
              className={`px-2.5 py-0.5 rounded text-xs hover:bg-slate-800 ${openMenu === 'file' ? 'bg-slate-800 text-white' : ''}`}
            >
              File
            </button>
            {openMenu === 'file' && (
              <div
                className="absolute left-0 top-full mt-0.5 w-52 bg-slate-900 border border-slate-700 rounded-md shadow-2xl py-1 z-50 text-xs"
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    onQuickAction('new_customer');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>New Customer</span>
                  <span className="text-slate-500 font-mono text-[10px]">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    onQuickAction('generate_bill');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Batch Invoicing</span>
                  <span className="text-slate-500 font-mono text-[10px]">F2</span>
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    onQuickAction('collect_payment');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Collect Payment</span>
                  <span className="text-slate-500 font-mono text-[10px]">F3</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    onTabChange('database_lan');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Backup Database...
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-950/60 text-rose-300"
                >
                  Lock Workstation
                </button>
              </div>
            )}
          </div>

          {/* Billing Menu */}
          <button
            onClick={() => onTabChange('billing')}
            className="px-2.5 py-0.5 rounded text-xs hover:bg-slate-800"
          >
            Billing
          </button>

          {/* Complaints Menu */}
          <button
            onClick={() => onTabChange('complaints')}
            className="px-2.5 py-0.5 rounded text-xs hover:bg-slate-800"
          >
            Complaints
          </button>

          {/* Reports Menu */}
          <button
            onClick={() => onTabChange('reports')}
            className="px-2.5 py-0.5 rounded text-xs hover:bg-slate-800"
          >
            Reports
          </button>

          {/* LAN & Database */}
          <button
            onClick={() => onTabChange('database_lan')}
            className="px-2.5 py-0.5 rounded text-xs hover:bg-slate-800"
          >
            Network / LAN
          </button>

          {/* Help Menu */}
          <button
            onClick={() => onTabChange('manual_install')}
            className="px-2.5 py-0.5 rounded text-xs hover:bg-slate-800 text-emerald-400 font-medium"
          >
            Help & User Manual (F1)
          </button>
        </div>

        {/* Right User Lock & Profile button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px]">Operator:</span>
            <span className="font-semibold text-white">{currentUser.name}</span>
            <span className="text-[10px] uppercase bg-slate-800 px-1.5 py-0.2 rounded text-emerald-400 font-mono">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onChangePin}
            title="Change Security PIN"
            className="hover:text-white p-1 text-slate-400"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            title="Logout / Switch Operator"
            className="hover:text-rose-400 p-1 text-slate-400"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Sidebar Navigation + Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="no-print w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              System Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer System Badge */}
          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">License:</span>
              <span className="text-emerald-400 font-semibold">Active Enterprise</span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-500">Network:</span>
              <span>LAN Connected</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-950 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* 4. Windows Status Bar at Bottom */}
      <footer className="no-print h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0 font-mono select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-200">System Ready (Offline)</span>
          </div>
          <span className="text-slate-700">|</span>
          <span>Central Database: ATS_ISP_CENTRAL.ACCDB</span>
          <span className="text-slate-700">|</span>
          <span>F2 (Bill) · F3 (Pay) · F4 (Complaint)</span>
        </div>

        <div className="flex items-center gap-3">
          <span>User: {currentUser.username} ({currentUser.role.toUpperCase()})</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-200 font-bold">{currentTime}</span>
        </div>
      </footer>
    </div>
  );
};
