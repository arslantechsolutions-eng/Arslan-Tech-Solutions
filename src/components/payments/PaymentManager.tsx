/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Payment Management Module
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  X,
  Lock,
  ArrowDownLeft,
  Building2,
  Wallet,
  FileText,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Payment, Customer, PaymentMethod } from '../../types';

interface PaymentManagerProps {
  onPrintReceipt: (payment: Payment) => void;
  currentUser: string;
  currentUserRole: 'admin' | 'staff';
  preselectedCustomer?: Customer | null;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({
  onPrintReceipt,
  currentUser,
  currentUserRole,
  preselectedCustomer,
}) => {
  const [payments, setPayments] = useState<Payment[]>(() => StorageService.getPayments());
  const customers = StorageService.getCustomers();
  const invoices = StorageService.getInvoices();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | 'month' | 'all'

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [cancellingPayment, setCancellingPayment] = useState<Payment | null>(null);
  const [adminPin, setAdminPin] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Collect Payment Form
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustomer ? preselectedCustomer.id : customers[0]?.id || ''
  );
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  const refreshData = () => {
    setPayments(StorageService.getPayments());
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  // Auto-fill amount when customer is picked if amount is 0
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const target = customers.find((c) => c.id === id);
    if (target && target.balance > 0) {
      setAmount(target.balance);
    }
  };

  const openCollectModal = (cust?: Customer) => {
    const activeCust = cust || preselectedCustomer || customers[0];
    if (activeCust) {
      setSelectedCustomerId(activeCust.id);
      setAmount(activeCust.balance > 0 ? activeCust.balance : activeCust.monthlyFee);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setReferenceNo('');
    setNotes('');
    setIsCollectModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    if (amount <= 0) {
      alert('Payment amount must be greater than 0 PKR.');
      return;
    }

    try {
      const payment = StorageService.collectPayment(
        {
          customerId: selectedCustomerId,
          amount,
          paymentDate,
          paymentMethod,
          referenceNo: referenceNo.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        currentUser
      );

      setIsCollectModalOpen(false);
      refreshData();
      onPrintReceipt(payment);
    } catch (err: any) {
      alert(`Error recording payment: ${err.message}`);
    }
  };

  const handleConfirmCancelPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingPayment) return;
    if (!adminPin) {
      setCancelError('Admin PIN required.');
      return;
    }
    if (!cancelReason.trim()) {
      setCancelError('Please specify a cancellation reason for the audit trail.');
      return;
    }

    try {
      StorageService.cancelPayment(cancellingPayment.id, cancelReason, currentUser, adminPin);
      setCancellingPayment(null);
      setAdminPin('');
      setCancelReason('');
      setCancelError('');
      refreshData();
      alert('Payment successfully cancelled and customer ledger reverted.');
    } catch (err: any) {
      setCancelError(err.message);
    }
  };

  // Filtered payments
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pay.referenceNo && pay.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || pay.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'all' || pay.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = pay.paymentDate === todayStr;
    } else if (dateFilter === 'month') {
      matchesDate = pay.paymentDate.startsWith('2026-10');
    }

    return matchesSearch && matchesMethod && matchesStatus && matchesDate;
  });

  // Summary Metrics
  const totalCollectedFiltered = filteredPayments
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + p.amount, 0);

  const cashCollections = filteredPayments
    .filter((p) => p.status === 'completed' && p.paymentMethod === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);

  const bankDigitalCollections = filteredPayments
    .filter((p) => p.status === 'completed' && p.paymentMethod !== 'cash')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-5">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Treasury & Payment Collections</span>
            <span aria-hidden="true">·</span>
            <span>Completed Receipts: {payments.filter((p) => p.status === 'completed').length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Real-Time Ledger Reconcile</span>
          </div>
          <h2 className="text-lg font-bold text-white">Payment Management & Cash Desk</h2>
        </div>

        <button
          onClick={() => openCollectModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Receive Customer Payment (F3)</span>
        </button>
      </div>

      {/* Collection Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Filtered Collection</span>
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-400">
              PKR {totalCollectedFiltered.toLocaleString()}
            </span>
          </div>
          <CreditCard className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Physical Cash Counter</span>
            <span className="text-lg font-bold font-mono tabular-nums text-white">
              PKR {cashCollections.toLocaleString()}
            </span>
          </div>
          <Wallet className="w-6 h-6 text-sky-400 opacity-60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Bank / EasyPaisa / JazzCash</span>
            <span className="text-lg font-bold font-mono tabular-nums text-purple-400">
              PKR {bankDigitalCollections.toLocaleString()}
            </span>
          </div>
          <Building2 className="w-6 h-6 text-purple-400 opacity-60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Receipt #, Customer Name, ID, or Bank Trx Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Dates</option>
              <option value="today" className="bg-slate-900">Today's Collections</option>
              <option value="month" className="bg-slate-900">October 2026</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Methods</option>
              <option value="cash" className="bg-slate-900">Cash Counter</option>
              <option value="bank_transfer" className="bg-slate-900">Bank Transfer</option>
              <option value="easypaisa" className="bg-slate-900">EasyPaisa</option>
              <option value="jazzcash" className="bg-slate-900">JazzCash</option>
              <option value="nayapay" className="bg-slate-900">NayaPay</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="completed" className="bg-slate-900">Valid / Completed</option>
              <option value="cancelled" className="bg-slate-900">Cancelled / Voided</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method / Mode</th>
                <th className="py-3 px-4">Reference / Trx ID</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4">Collector</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No payment receipts match current filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr
                    key={pay.id}
                    className={`hover:bg-slate-800/60 transition-colors ${
                      pay.status === 'cancelled' ? 'opacity-50 line-through bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                      {pay.receiptNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{pay.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{pay.customerId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{pay.paymentDate}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[11px] font-medium text-slate-200">
                        {pay.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {pay.referenceNo || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-white">
                      PKR {pay.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{pay.collectorName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          pay.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPrintReceipt(pay)}
                          title="Print Receipt (A4 or Thermal)"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {pay.status === 'completed' && (
                          <button
                            onClick={() => {
                              setCancellingPayment(pay);
                              setAdminPin('');
                              setCancelReason('');
                              setCancelError('');
                            }}
                            title="Cancel / Void Payment (Admin PIN Required)"
                            className="p-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-950/80 px-4 py-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Total {filteredPayments.length} receipts displayed</span>
          <span>Double verification enabled for all cash transactions</span>
        </div>
      </div>

      {/* COLLECT PAYMENT MODAL */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Receive Customer Payment</h3>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Subscriber / Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id} - {c.area}) - Arrears: PKR {c.balance}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerObj && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Outstanding Dues:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        selectedCustomerObj.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      PKR {selectedCustomerObj.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Monthly Package Rate:</span>
                    <span className="font-mono text-slate-300">PKR {selectedCustomerObj.monthlyFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Installation Area:</span>
                    <span className="text-slate-300">{selectedCustomerObj.area}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Payment Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm font-bold focus:outline-hidden focus:border-emerald-500"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {selectedCustomerObj && selectedCustomerObj.balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(selectedCustomerObj.balance)}
                        className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700"
                      >
                        Full Dues
                      </button>
                    )}
                    {selectedCustomerObj && (
                      <button
                        type="button"
                        onClick={() => setAmount(selectedCustomerObj.monthlyFee)}
                        className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700"
                      >
                        1 Month Fee
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500 uppercase text-xs"
                  >
                    <option value="cash">Cash Counter</option>
                    <option value="bank_transfer">Bank Transfer (HBL/Meezan)</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="nayapay">NayaPay</option>
                    <option value="cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Reference / Bank Transaction ID</label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. TRX-992144 or Cheque #"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Collector Remarks / Memo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received at shop counter / full monthly payment"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm transition-colors cursor-pointer"
                >
                  Submit Payment & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL PAYMENT / AUTHORIZED VOID MODAL */}
      {cancellingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-rose-950/40">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Void / Cancel Payment Receipt</h3>
              </div>
              <button onClick={() => setCancellingPayment(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancelPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div>Receipt: <strong className="font-mono text-white">{cancellingPayment.receiptNumber}</strong></div>
                <div>Customer: <strong className="text-white">{cancellingPayment.customerName}</strong></div>
                <div>Amount: <strong className="font-mono text-emerald-400">PKR {cancellingPayment.amount.toLocaleString()}</strong></div>
              </div>

              <p className="text-rose-300">
                Warning: Cancelling this receipt will immediately add PKR {cancellingPayment.amount.toLocaleString()} back to the customer's outstanding dues and record an authorized entry in the system audit log.
              </p>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Reason for Cancellation *</label>
                <textarea
                  rows={2}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Bank transfer bounced, entered incorrect subscriber by operator mistake..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Administrator Security PIN * (Default: 1234)</span>
                </label>
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 4-digit admin PIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {cancelError && (
                <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                  {cancelError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancellingPayment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Confirm Void & Revert Dues
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
