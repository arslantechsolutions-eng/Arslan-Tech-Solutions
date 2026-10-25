/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Comprehensive Reports & Analytics Module
 */

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Filter,
  Calendar,
  CreditCard,
  Users,
  Receipt,
  Wrench,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Customer, Invoice, Payment, Complaint, Technician } from '../../types';

type ReportType =
  | 'customer_balances'
  | 'monthly_invoices'
  | 'daily_cashbook'
  | 'complaints_tech'
  | 'package_distribution';

export const ReportsManager: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('customer_balances');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [statusFilter, setStatusFilter] = useState('all');

  const customers = StorageService.getCustomers();
  const invoices = StorageService.getInvoices();
  const payments = StorageService.getPayments();
  const complaints = StorageService.getComplaints();
  const technicians = StorageService.getTechnicians();
  const packages = StorageService.getPackages();

  const handlePrint = () => {
    window.print();
  };

  // CSV Export utility
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map((row) =>
          headers.map((fieldName) => JSON.stringify(row[fieldName] ?? '')).join(',')
        ),
      ].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Title & Navigation Tabs */}
      <div className="no-print bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Audit & Executive Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Financial & Field Reports</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Print & CSV Export Ready</span>
          </div>
          <h2 className="text-lg font-bold text-white">Reports & Statement Generator</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Current Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="no-print flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs">
        <button
          onClick={() => setActiveReport('customer_balances')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeReport === 'customer_balances'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Outstanding Dues & Balances</span>
        </button>
        <button
          onClick={() => setActiveReport('monthly_invoices')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeReport === 'monthly_invoices'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Monthly Invoices & Collections</span>
        </button>
        <button
          onClick={() => setActiveReport('daily_cashbook')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeReport === 'daily_cashbook'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Cash & Bank Collection Book</span>
        </button>
        <button
          onClick={() => setActiveReport('complaints_tech')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeReport === 'complaints_tech'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Complaints & Tech Performance</span>
        </button>
        <button
          onClick={() => setActiveReport('package_distribution')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeReport === 'package_distribution'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Package-wise Revenue</span>
        </button>
      </div>

      {/* Render Selected Report View */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        {activeReport === 'customer_balances' && (
          <CustomerBalancesReport
            customers={customers}
            packages={packages}
            onExportCSV={exportToCSV}
          />
        )}

        {activeReport === 'monthly_invoices' && (
          <MonthlyInvoicesReport
            invoices={invoices}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onExportCSV={exportToCSV}
          />
        )}

        {activeReport === 'daily_cashbook' && (
          <DailyCashbookReport payments={payments} onExportCSV={exportToCSV} />
        )}

        {activeReport === 'complaints_tech' && (
          <ComplaintsTechReport
            complaints={complaints}
            technicians={technicians}
            onExportCSV={exportToCSV}
          />
        )}

        {activeReport === 'package_distribution' && (
          <PackageDistributionReport
            packages={packages}
            customers={customers}
            onExportCSV={exportToCSV}
          />
        )}
      </div>
    </div>
  );
};

// 1. Customer Balances Report
const CustomerBalancesReport: React.FC<{
  customers: Customer[];
  packages: any[];
  onExportCSV: (data: any[], filename: string) => void;
}> = ({ customers, packages, onExportCSV }) => {
  const [filter, setFilter] = useState<'all' | 'with_dues'>('all');

  const filtered = customers.filter((c) => (filter === 'with_dues' ? c.balance > 0 : true));
  const totalDues = filtered.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);

  const handleExport = () => {
    const data = filtered.map((c) => ({
      ID: c.id,
      AccountNo: c.accountNo,
      Name: c.name,
      Phone: c.phone,
      Area: c.area,
      Status: c.status,
      MonthlyFee: c.monthlyFee,
      BalanceDues: c.balance,
    }));
    onExportCSV(data, `Customer_Balances_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Customer Balances & Arrears Ledger</h3>
          <p className="text-xs text-slate-400">ARSLAN TECH SOLUTIONS ISP · Complete Subscriber Aging Report</p>
        </div>
        <div className="no-print flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-1.5"
          >
            <option value="all">All Subscribers</option>
            <option value="with_dues">Only Subscribers with Dues</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded border border-slate-800 text-xs">
        <div>Total Subscribers Listed: <strong className="text-white font-mono">{filtered.length}</strong></div>
        <div>With Overdue Arrears: <strong className="text-rose-400 font-mono">{filtered.filter((c) => c.balance > 0).length}</strong></div>
        <div className="text-right">Total Outstanding Balance: <strong className="text-rose-400 font-mono font-bold text-sm">PKR {totalDues.toLocaleString()}</strong></div>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <th className="py-2.5">Account / ID</th>
            <th className="py-2.5">Subscriber Name</th>
            <th className="py-2.5">Phone / Area</th>
            <th className="py-2.5">Status</th>
            <th className="py-2.5 text-right">Monthly Fee</th>
            <th className="py-2.5 text-right">Outstanding Dues</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {filtered.map((c) => (
            <tr key={c.id}>
              <td className="py-2 font-mono text-slate-300">{c.accountNo} ({c.id})</td>
              <td className="py-2 font-medium text-white">{c.name}</td>
              <td className="py-2 text-slate-400">{c.phone} · {c.area}</td>
              <td className="py-2 uppercase text-[10px]">
                <span className={c.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>
                  {c.status}
                </span>
              </td>
              <td className="py-2 text-right font-mono tabular-nums text-slate-300">PKR {c.monthlyFee.toLocaleString()}</td>
              <td className="py-2 text-right font-mono tabular-nums font-bold">
                <span className={c.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  PKR {c.balance.toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 2. Monthly Invoices Report
const MonthlyInvoicesReport: React.FC<{
  invoices: Invoice[];
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  onExportCSV: (data: any[], filename: string) => void;
}> = ({ invoices, selectedMonth, onMonthChange, onExportCSV }) => {
  const filtered = invoices.filter((i) => i.billingMonth === selectedMonth);

  const totalInvoiced = filtered.reduce((acc, i) => acc + i.totalPayable, 0);
  const totalCollected = filtered.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalPending = filtered.reduce((acc, i) => acc + i.remainingBalance, 0);

  const handleExport = () => {
    const data = filtered.map((i) => ({
      InvoiceNumber: i.invoiceNumber,
      Customer: i.customerName,
      Account: i.customerAccountNo,
      Month: i.billingMonth,
      IssueDate: i.issueDate,
      DueDate: i.dueDate,
      TotalPayable: i.totalPayable,
      Paid: i.amountPaid,
      Remaining: i.remainingBalance,
      Status: i.status,
    }));
    onExportCSV(data, `Invoices_${selectedMonth.replace(/\s+/g, '_')}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Monthly Invoices & Revenue Recovery</h3>
          <p className="text-xs text-slate-400">ARSLAN TECH SOLUTIONS ISP · Cycle Billing Ledger</p>
        </div>
        <div className="no-print flex items-center gap-2">
          <input
            type="text"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded p-1.5"
            placeholder="e.g. October 2026"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 bg-slate-950 p-3 rounded border border-slate-800 text-xs text-center font-mono">
        <div>
          <span className="text-slate-500 text-[10px] block">Invoices Issued</span>
          <span className="font-bold text-white text-sm">{filtered.length}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Total Invoiced</span>
          <span className="font-bold text-white text-sm">PKR {totalInvoiced.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Recovered</span>
          <span className="font-bold text-emerald-400 text-sm">PKR {totalCollected.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Outstanding</span>
          <span className="font-bold text-rose-400 text-sm">PKR {totalPending.toLocaleString()}</span>
        </div>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <th className="py-2.5">Invoice #</th>
            <th className="py-2.5">Subscriber</th>
            <th className="py-2.5">Due Date</th>
            <th className="py-2.5 text-right">Total Payable</th>
            <th className="py-2.5 text-right">Amount Paid</th>
            <th className="py-2.5 text-right">Balance Due</th>
            <th className="py-2.5 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {filtered.map((inv) => (
            <tr key={inv.id}>
              <td className="py-2 font-mono text-white">{inv.invoiceNumber}</td>
              <td className="py-2 font-medium text-slate-200">{inv.customerName}</td>
              <td className="py-2 font-mono text-slate-400">{inv.dueDate}</td>
              <td className="py-2 text-right font-mono tabular-nums text-white">PKR {inv.totalPayable.toLocaleString()}</td>
              <td className="py-2 text-right font-mono tabular-nums text-emerald-400">PKR {inv.amountPaid.toLocaleString()}</td>
              <td className="py-2 text-right font-mono tabular-nums text-rose-400">PKR {inv.remainingBalance.toLocaleString()}</td>
              <td className="py-2 text-right uppercase text-[10px] font-semibold text-slate-300">{inv.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 3. Daily Cashbook Report
const DailyCashbookReport: React.FC<{
  payments: Payment[];
  onExportCSV: (data: any[], filename: string) => void;
}> = ({ payments, onExportCSV }) => {
  const [filterDate, setFilterDate] = useState('all');

  const filtered = payments.filter((p) => (filterDate === 'all' ? true : p.paymentDate === filterDate));
  const total = filtered.filter((p) => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);

  const handleExport = () => {
    const data = filtered.map((p) => ({
      ReceiptNumber: p.receiptNumber,
      Customer: p.customerName,
      CustomerID: p.customerId,
      Date: p.paymentDate,
      Amount: p.amount,
      Method: p.paymentMethod,
      Reference: p.referenceNo || '',
      Collector: p.collectorName,
      Status: p.status,
    }));
    onExportCSV(data, `Collection_Cashbook_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Cash & Bank Collection Book</h3>
          <p className="text-xs text-slate-400">ARSLAN TECH SOLUTIONS ISP · Daily Treasury Log</p>
        </div>
        <div className="no-print flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center text-xs">
        <div>Total Verified Collections: <strong className="text-white font-mono">{filtered.filter((p) => p.status === 'completed').length} Receipts</strong></div>
        <div>Total Recovered Sum: <strong className="text-emerald-400 font-mono font-bold text-sm">PKR {total.toLocaleString()}</strong></div>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <th className="py-2.5">Receipt #</th>
            <th className="py-2.5">Date</th>
            <th className="py-2.5">Subscriber</th>
            <th className="py-2.5">Mode</th>
            <th className="py-2.5">Reference ID</th>
            <th className="py-2.5 text-right">Amount (PKR)</th>
            <th className="py-2.5 text-right">Collector</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {filtered.map((pay) => (
            <tr key={pay.id} className={pay.status === 'cancelled' ? 'opacity-40 line-through' : ''}>
              <td className="py-2 font-mono text-emerald-400">{pay.receiptNumber}</td>
              <td className="py-2 font-mono text-slate-300">{pay.paymentDate}</td>
              <td className="py-2 font-medium text-white">{pay.customerName}</td>
              <td className="py-2 uppercase text-slate-300">{pay.paymentMethod.replace('_', ' ')}</td>
              <td className="py-2 font-mono text-slate-400">{pay.referenceNo || '-'}</td>
              <td className="py-2 text-right font-mono tabular-nums font-bold text-white">PKR {pay.amount.toLocaleString()}</td>
              <td className="py-2 text-right text-slate-400">{pay.collectorName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 4. Complaints & Tech Performance Report
const ComplaintsTechReport: React.FC<{
  complaints: Complaint[];
  technicians: Technician[];
  onExportCSV: (data: any[], filename: string) => void;
}> = ({ complaints, technicians, onExportCSV }) => {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-slate-800">
        <h3 className="text-base font-bold text-white">Field Operations & Technician Performance</h3>
        <p className="text-xs text-slate-400">ARSLAN TECH SOLUTIONS ISP · Service Level Agreement (SLA) & Job Completion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {technicians.map((tech) => {
          const techTickets = complaints.filter((c) => c.assignedTechnicianId === tech.id);
          const resolved = techTickets.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
          const pending = techTickets.filter((c) => c.status !== 'resolved' && c.status !== 'closed').length;

          return (
            <div key={tech.id} className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{tech.name}</span>
                <span className="font-mono text-slate-400">{tech.area}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contact Phone:</span>
                <span className="font-mono text-slate-200">{tech.phone}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Assigned Pending Jobs:</span>
                <span className="font-mono font-bold text-amber-400">{pending}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Successfully Resolved Tickets:</span>
                <span className="font-mono font-bold text-emerald-400">{tech.completedJobsCount + resolved}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Package Distribution Report
const PackageDistributionReport: React.FC<{
  packages: any[];
  customers: Customer[];
  onExportCSV: (data: any[], filename: string) => void;
}> = ({ packages, customers, onExportCSV }) => {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-slate-800">
        <h3 className="text-base font-bold text-white">Bandwidth & Package Distribution Summary</h3>
        <p className="text-xs text-slate-400">ARSLAN TECH SOLUTIONS ISP · Subscriber Demographics by Speed & Plan</p>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <th className="py-2.5">Package Name</th>
            <th className="py-2.5">Speed (Mbps)</th>
            <th className="py-2.5 text-right">Tariff Rate</th>
            <th className="py-2.5 text-right">Subscribers Count</th>
            <th className="py-2.5 text-right">Monthly Revenue Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {packages.map((pkg) => {
            const count = customers.filter((c) => c.packageId === pkg.id).length;
            const rev = count * pkg.price;
            return (
              <tr key={pkg.id}>
                <td className="py-2 font-semibold text-white">{pkg.name}</td>
                <td className="py-2 font-mono text-slate-300">{pkg.speedMbps} Mbps</td>
                <td className="py-2 text-right font-mono text-slate-300">PKR {pkg.price.toLocaleString()}</td>
                <td className="py-2 text-right font-mono font-bold text-white">{count} Subscribers</td>
                <td className="py-2 text-right font-mono tabular-nums font-bold text-emerald-400">
                  PKR {rev.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
