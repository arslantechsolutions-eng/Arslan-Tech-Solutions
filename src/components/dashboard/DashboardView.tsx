/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Main Dashboard View
 */

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  AlertOctagon,
  CreditCard,
  AlertTriangle,
  Receipt,
  CheckCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldAlert,
  Search,
  Wrench,
  Database,
  Printer,
  Calendar,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Customer, Complaint, Invoice, Payment, ActiveTab } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onQuickAction: (action: string) => void;
  onPrintDocument: (type: 'invoice' | 'receipt' | 'complaint' | 'customer_profile', data: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onQuickAction,
  onPrintDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const metrics = StorageService.getDashboardMetrics();
  const customers = StorageService.getCustomers();
  const complaints = StorageService.getComplaints();
  const invoices = StorageService.getInvoices();
  const payments = StorageService.getPayments();

  // Filtered customers for quick search
  const searchedCustomers = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.accountNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.area.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const urgentComplaints = complaints
    .filter((c) => c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress')
    .slice(0, 5);

  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / System Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>ARSLAN TECH SOLUTIONS ISP</span>
            <span aria-hidden="true">·</span>
            <span>Version 4.0 Professional</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">100% Offline Central Database</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Operations & Billing Control Center
          </h1>
        </div>

        {/* Quick Customer Lookup Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search customer, phone, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
          {searchedCustomers.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-20 overflow-hidden divide-y divide-slate-800">
              {searchedCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSearchQuery('');
                    onNavigate('customers');
                  }}
                  className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{cust.name}</span>
                    <span className="text-slate-400 ml-2 font-mono">{cust.id}</span>
                    <div className="text-[11px] text-slate-400">{cust.area} · {cust.phone}</div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-semibold ${cust.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      PKR {cust.balance.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase">{cust.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (All 10 required items from prompt) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {metrics.totalCustomers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Network Base</div>
        </div>

        {/* Active Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Active Customers</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {metrics.activeCustomers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Generating revenue</div>
        </div>

        {/* Inactive Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Inactive Customers</span>
            <UserX className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-300">
            {metrics.inactiveCustomers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Paused / Disconnected</div>
        </div>

        {/* Suspended Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Suspended</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            {metrics.suspendedCustomers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Overdue default lock</div>
        </div>

        {/* Unresolved Complaints */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Unresolved Tickets</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">
            {metrics.unresolvedComplaints.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Action needed</div>
        </div>

        {/* Today's Payments */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Today's Collections</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            PKR {metrics.todayPayments.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Collected today</div>
        </div>

        {/* Total Outstanding Dues */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Outstanding Dues</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-400">
            PKR {metrics.totalOutstandingDues.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total pending arrears</div>
        </div>

        {/* Monthly Billing */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Monthly Invoiced</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            PKR {metrics.monthlyBillingTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">October 2026 Invoices</div>
        </div>

        {/* Monthly Revenue */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Monthly Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            PKR {metrics.monthlyRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total received this month</div>
        </div>

        {/* Resolved Complaints */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-800/40 p-4 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Resolved Tickets</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {metrics.resolvedComplaints.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tickets closed</div>
        </div>
      </div>

      {/* Quick Access Module Buttons Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Quick-Access Workflow Shortcuts
          </span>
          <span className="text-xs text-slate-500">Shortcuts: F2 (Bill) · F3 (Pay) · F4 (Ticket)</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onQuickAction('new_customer')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={() => onQuickAction('collect_payment')}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Receive Payment (F3)</span>
          </button>
          <button
            onClick={() => onQuickAction('generate_bill')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-sky-400" />
            <span>Generate Invoices (F2)</span>
          </button>
          <button
            onClick={() => onQuickAction('new_complaint')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Register Ticket (F4)</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Print Financial Reports</span>
          </button>
          <button
            onClick={() => onNavigate('database_lan')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Backup / LAN Setup</span>
          </button>
        </div>
      </div>

      {/* Two Column Detailed Operational View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Unresolved Complaints Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Active Complaints Queue</h2>
            </div>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All ({metrics.unresolvedComplaints})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentComplaints.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
              All complaints are currently resolved. Network nominal.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {urgentComplaints.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{item.ticketNumber}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                          item.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-slate-400">{item.category.replace('_', ' ')}</span>
                    </div>
                    <p className="text-slate-300 font-medium">{item.customerName} ({item.customerArea})</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{item.description}</p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="inline-block text-[11px] text-slate-400">
                      {item.assignedTechnicianName ? (
                        <span className="text-emerald-400 font-medium">{item.assignedTechnicianName}</span>
                      ) : (
                        <span className="text-rose-400">Needs Dispatch</span>
                      )}
                    </span>
                    <div>
                      <button
                        onClick={() => onPrintDocument('complaint', item)}
                        className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                      >
                        Job Card
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Payment Collections Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Recent Payment Collections</h2>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Payment Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentPayments.map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{pay.customerName}</span>
                    <span className="font-mono text-slate-500">{pay.receiptNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span>{pay.paymentDate}</span>
                    <span className="mx-1.5">·</span>
                    <span className="uppercase text-slate-300">{pay.paymentMethod.replace('_', ' ')}</span>
                    <span className="mx-1.5">·</span>
                    <span>By: {pay.collectorName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    PKR {pay.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onPrintDocument('receipt', pay)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Print Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Collection Status Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Monthly Collection Target</span>
              <span className="font-mono tabular-nums text-white">
                {metrics.monthlyBillingTotal > 0
                  ? Math.round((metrics.monthlyRevenue / metrics.monthlyBillingTotal) * 100)
                  : 0}
                % Recovered
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    metrics.monthlyBillingTotal > 0
                      ? Math.min(100, Math.round((metrics.monthlyRevenue / metrics.monthlyBillingTotal) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
