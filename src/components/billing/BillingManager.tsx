/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Billing & Invoice Management Module
 */

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  CreditCard,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Invoice, Customer, InvoiceStatus } from '../../types';

interface BillingManagerProps {
  onPrintInvoice: (invoice: Invoice) => void;
  onReceivePaymentForInvoice: (invoice: Invoice) => void;
  currentUser: string;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  onPrintInvoice,
  onReceivePaymentForInvoice,
  currentUser,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const customers = StorageService.getCustomers();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Batch Generation Form State
  const [batchMonth, setBatchMonth] = useState('November 2026');
  const [batchDueDate, setBatchDueDate] = useState('2026-11-10');
  const [batchResult, setBatchResult] = useState<{ generated: number; skipped: number } | null>(null);

  // Manual Invoice Form State
  const [manualForm, setManualForm] = useState({
    customerId: customers[0]?.id || '',
    billingMonth: 'October 2026',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    packageCharges: 2200,
    installationCharges: 0,
    otherCharges: 0,
    otherChargesDesc: 'Optical Fiber Drop Cable & ONU configuration',
    discount: 0,
    lateFee: 200,
  });

  const refreshData = () => {
    setInvoices(StorageService.getInvoices());
  };

  // Distinct Months
  const availableMonths = Array.from(new Set(invoices.map((i) => i.billingMonth)));

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerAccountNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMonth = monthFilter === 'all' || inv.billingMonth === monthFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const handleRunBatchBilling = (e: React.FormEvent) => {
    e.preventDefault();
    const result = StorageService.generateBatchInvoices(batchMonth, batchDueDate, currentUser);
    setBatchResult(result);
    refreshData();
  };

  const handleManualCustomerChange = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    setManualForm((prev) => ({
      ...prev,
      customerId,
      packageCharges: cust ? cust.monthlyFee : 2200,
    }));
  };

  const handleSaveManualInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.customerId) {
      alert('Please select a customer.');
      return;
    }

    try {
      const created = StorageService.addManualInvoice(manualForm, currentUser);
      setIsManualModalOpen(false);
      refreshData();
      onPrintInvoice(created);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Summary Metrics for Invoices
  const totalInvoiced = filteredInvoices.reduce((acc, i) => acc + i.totalPayable, 0);
  const totalPaid = filteredInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalRemaining = filteredInvoices.reduce((acc, i) => acc + i.remainingBalance, 0);

  return (
    <div className="space-y-5">
      {/* Module Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Billing Engine & Ledgers</span>
            <span aria-hidden="true">·</span>
            <span>Total Invoices: {invoices.length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Arrears Auto-Calculation Active</span>
          </div>
          <h2 className="text-lg font-bold text-white">Monthly Invoices & Bill Generation</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setBatchResult(null);
              setIsBatchModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Monthly Bills</span>
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Manual Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar for currently filtered set */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Invoiced Amount</span>
            <span className="text-lg font-bold font-mono tabular-nums text-white">
              PKR {totalInvoiced.toLocaleString()}
            </span>
          </div>
          <Receipt className="w-6 h-6 text-sky-400 opacity-60" />
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Recovered / Paid</span>
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-400">
              PKR {totalPaid.toLocaleString()}
            </span>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Uncollected Balance Due</span>
            <span className="text-lg font-bold font-mono tabular-nums text-rose-400">
              PKR {totalRemaining.toLocaleString()}
            </span>
          </div>
          <AlertCircle className="w-6 h-6 text-rose-400 opacity-60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Invoice #, Customer Name, Account #, or Customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Billing Month Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-900">{m}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="paid" className="bg-slate-900">Paid Only</option>
              <option value="unpaid" className="bg-slate-900">Unpaid Only</option>
              <option value="partial" className="bg-slate-900">Partially Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Package Fee</th>
                <th className="py-3 px-4 text-right">Arrears</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No invoices found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    onClick={() => setViewingInvoice(inv)}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-white group-hover:text-emerald-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {inv.customerAccountNo} · {inv.customerId}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{inv.billingMonth}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      PKR {inv.packageCharges.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {inv.previousDues > 0 ? `PKR ${inv.previousDues.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-white">
                      PKR {inv.totalPayable.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                      PKR {inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                      <span className={inv.remainingBalance > 0 ? 'text-rose-400' : 'text-slate-500'}>
                        PKR {inv.remainingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : inv.status === 'partial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inv.remainingBalance > 0 && (
                          <button
                            onClick={() => onReceivePaymentForInvoice(inv)}
                            title="Collect Payment Against this Bill"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onPrintInvoice(inv)}
                          title="Print Formal Invoice"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-950/80 px-4 py-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Displaying {filteredInvoices.length} invoices</span>
          <span>Click any invoice row to view complete calculation breakdown</span>
        </div>
      </div>

      {/* BATCH BILL GENERATION WIZARD MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Automatic Monthly Billing Generator</h3>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunBatchBilling} className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                This batch tool automatically creates monthly invoices for all active and suspended subscribers. It automatically rolls forward any previous unpaid dues and enforces duplicate bill prevention.
              </p>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Billing Month Name *</label>
                <input
                  type="text"
                  required
                  value={batchMonth}
                  onChange={(e) => setBatchMonth(e.target.value)}
                  placeholder="e.g. November 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={batchDueDate}
                  onChange={(e) => setBatchDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded text-[11px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Eligible Active & Suspended Customers:</span>
                  <span className="font-bold text-white font-mono">
                    {customers.filter((c) => c.status === 'active' || c.status === 'suspended').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duplicate Bill Check:</span>
                  <span className="text-emerald-400 font-medium">Enabled (Won't duplicate if already generated)</span>
                </div>
              </div>

              {batchResult && (
                <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded text-emerald-300">
                  <div className="font-bold">Generation Completed Successfully!</div>
                  <div>Generated {batchResult.generated} new invoices.</div>
                  {batchResult.skipped > 0 && (
                    <div className="text-slate-400 text-[11px]">
                      Skipped {batchResult.skipped} customers because an invoice already existed for this month.
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm transition-colors cursor-pointer"
                >
                  Run Batch Billing Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL INVOICE MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="text-base font-bold text-white">Create Custom / Installation Invoice</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualInvoice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Customer *</label>
                <select
                  value={manualForm.customerId}
                  onChange={(e) => handleManualCustomerChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id} - {c.area}) - Arrears: PKR {c.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Billing Month Name</label>
                  <input
                    type="text"
                    value={manualForm.billingMonth}
                    onChange={(e) => setManualForm({ ...manualForm, billingMonth: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.dueDate}
                    onChange={(e) => setManualForm({ ...manualForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Monthly Package (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.packageCharges}
                    onChange={(e) => setManualForm({ ...manualForm, packageCharges: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Installation Fee (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.installationCharges}
                    onChange={(e) => setManualForm({ ...manualForm, installationCharges: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Other Charges (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.otherCharges}
                    onChange={(e) => setManualForm({ ...manualForm, otherCharges: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Other Charges Description</label>
                <input
                  type="text"
                  value={manualForm.otherChargesDesc}
                  onChange={(e) => setManualForm({ ...manualForm, otherChargesDesc: e.target.value })}
                  placeholder="e.g. Dual-band Wi-Fi Router sale, Drop wire"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Discount / Adjustment (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.discount}
                    onChange={(e) => setManualForm({ ...manualForm, discount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Late Fee Surcharge (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualForm.lateFee}
                    onChange={(e) => setManualForm({ ...manualForm, lateFee: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Generate & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INVOICE DETAIL MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div>
                <h3 className="text-base font-bold text-white">Invoice Details</h3>
                <p className="text-xs text-slate-400 font-mono">{viewingInvoice.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintInvoice(viewingInvoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-semibold text-white">{viewingInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account #:</span>
                  <span className="font-mono text-slate-200">{viewingInvoice.customerAccountNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Month:</span>
                  <span className="text-slate-200">{viewingInvoice.billingMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="font-mono text-slate-200">{viewingInvoice.dueDate}</span>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-b border-slate-800 py-3 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Package Charges:</span>
                  <span className="tabular-nums text-white">PKR {viewingInvoice.packageCharges.toLocaleString()}</span>
                </div>
                {viewingInvoice.installationCharges > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Installation Charges:</span>
                    <span className="tabular-nums text-white">PKR {viewingInvoice.installationCharges.toLocaleString()}</span>
                  </div>
                )}
                {viewingInvoice.otherCharges > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Other Charges ({viewingInvoice.otherChargesDesc || 'Services'}):</span>
                    <span className="tabular-nums text-white">PKR {viewingInvoice.otherCharges.toLocaleString()}</span>
                  </div>
                )}
                {viewingInvoice.previousDues > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Previous Arrears:</span>
                    <span className="tabular-nums">PKR {viewingInvoice.previousDues.toLocaleString()}</span>
                  </div>
                )}
                {viewingInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="tabular-nums">- PKR {viewingInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800 text-sm">
                  <span>Total Payable:</span>
                  <span className="tabular-nums">PKR {viewingInvoice.totalPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Amount Paid:</span>
                  <span className="tabular-nums">PKR {viewingInvoice.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Remaining Balance:</span>
                  <span className="tabular-nums">PKR {viewingInvoice.remainingBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-bold uppercase text-xs text-white">{viewingInvoice.status}</span>
                </div>
                {viewingInvoice.remainingBalance > 0 && (
                  <button
                    onClick={() => {
                      setViewingInvoice(null);
                      onReceivePaymentForInvoice(viewingInvoice);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                  >
                    Receive Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
