/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Customer Management Module
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Eye,
  Filter,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Wifi,
  FileText,
  X,
  Phone,
  MapPin,
  Calendar,
  Lock,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Customer, ConnectionStatus, InternetPackage } from '../../types';

interface CustomerManagerProps {
  onPrintCustomerProfile: (customer: Customer) => void;
  onReceivePaymentForCustomer: (customer: Customer) => void;
  currentUserRole: 'admin' | 'staff';
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  onPrintCustomerProfile,
  onReceivePaymentForCustomer,
  currentUserRole,
}) => {
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const packages = StorageService.getPackages();
  const invoices = StorageService.getInvoices();
  const payments = StorageService.getPayments();
  const complaints = StorageService.getComplaints();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState<'profile' | 'invoices' | 'payments' | 'complaints'>('profile');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    email: '',
    address: '',
    area: 'Gulberg III',
    packageId: packages[0]?.id || 'PKG-15M',
    monthlyFee: packages[0]?.price || 1500,
    installationDate: new Date().toISOString().split('T')[0],
    billingCycleDay: 1,
    status: 'active' as ConnectionStatus,
    serviceType: 'Fiber (GPON)' as Customer['serviceType'],
    pppoeUsername: '',
    pppoePassword: '',
    ipAddress: '',
    onuMac: '',
    routerModel: 'Huawei GPON ONU',
    balance: 0,
    notes: '',
  });

  const refreshData = () => {
    setCustomers(StorageService.getCustomers());
  };

  // Distinct Areas
  const availableAreas = Array.from(new Set(customers.map((c) => c.area).filter(Boolean)));

  // Filtered List
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.accountNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.pppoeUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.onuMac.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = areaFilter === 'all' || cust.area === areaFilter;
    const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      cnic: '',
      email: '',
      address: '',
      area: availableAreas[0] || 'Gulberg III',
      packageId: packages[0]?.id || 'PKG-15M',
      monthlyFee: packages[0]?.price || 1500,
      installationDate: new Date().toISOString().split('T')[0],
      billingCycleDay: 1,
      status: 'active',
      serviceType: 'Fiber (GPON)',
      pppoeUsername: `ats_${Date.now().toString().slice(-4)}`,
      pppoePassword: 'pass' + Math.floor(1000 + Math.random() * 9000),
      ipAddress: '',
      onuMac: 'F8:E7:1E:' + Math.floor(10 + Math.random() * 89) + ':' + Math.floor(10 + Math.random() * 89) + ':' + Math.floor(10 + Math.random() * 89),
      routerModel: 'Huawei HG8145V5 Dual Band',
      balance: 0,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      cnic: cust.cnic,
      email: cust.email || '',
      address: cust.address,
      area: cust.area,
      packageId: cust.packageId,
      monthlyFee: cust.monthlyFee,
      installationDate: cust.installationDate,
      billingCycleDay: cust.billingCycleDay,
      status: cust.status,
      serviceType: cust.serviceType,
      pppoeUsername: cust.pppoeUsername,
      pppoePassword: cust.pppoePassword || '',
      ipAddress: cust.ipAddress || '',
      onuMac: cust.onuMac,
      routerModel: cust.routerModel || '',
      balance: cust.balance,
      notes: cust.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handlePackageChange = (pkgId: string) => {
    const selected = packages.find((p) => p.id === pkgId);
    setFormData((prev) => ({
      ...prev,
      packageId: pkgId,
      monthlyFee: selected ? selected.price : prev.monthlyFee,
    }));
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter customer full name and phone number.');
      return;
    }

    if (editingCustomer) {
      const updated: Customer = {
        ...editingCustomer,
        ...formData,
      };
      StorageService.updateCustomer(updated, 'Admin');
    } else {
      StorageService.addCustomer(formData, 'Admin');
    }

    setIsAddModalOpen(false);
    refreshData();
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (currentUserRole !== 'admin') {
      alert('Permission Denied: Only Administrator accounts can delete customer records.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete customer record for "${name}" (${id})?`)) {
      StorageService.deleteCustomer(id, 'Admin');
      refreshData();
      if (viewingCustomer?.id === id) setViewingCustomer(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Subscribers & Network Accounts</span>
            <span aria-hidden="true">·</span>
            <span>Total: {customers.length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">
              Active: {customers.filter((c) => c.status === 'active').length}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Customer Account Management</h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Mobile, Customer ID, Account #, or MAC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Area Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Areas</option>
              {availableAreas.map((a) => (
                <option key={a} value={a} className="bg-slate-900">{a}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="suspended" className="bg-slate-900">Suspended</option>
              <option value="inactive" className="bg-slate-900">Inactive</option>
              <option value="disconnected" className="bg-slate-900">Disconnected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Account / ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / Area</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4">Outstanding Dues</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const pkg = packages.find((p) => p.id === cust.packageId);
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                      onClick={() => setViewingCustomer(cust)}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-300">
                        <div>{cust.accountNo}</div>
                        <div className="text-[10px] text-slate-500">{cust.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {cust.name}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">User: {cust.pppoeUsername}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-mono">{cust.phone}</div>
                        <div className="text-[11px] text-slate-400">{cust.area}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span>{pkg?.name || 'Standard Package'}</span>
                        <div className="text-[10px] text-slate-500">{cust.serviceType}</div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                        PKR {cust.monthlyFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                        <span className={cust.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          PKR {cust.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            cust.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : cust.status === 'suspended'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onReceivePaymentForCustomer(cust)}
                            title="Collect Payment"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPrintCustomerProfile(cust)}
                            title="Print Customer Profile Dossier"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(cust)}
                            title="Edit Customer Details"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUserRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                              title="Delete Record"
                              className="p-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-950/80 px-4 py-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredCustomers.length} of {customers.length} total subscribers</span>
          <span>Click any customer row to open full ledger & service dossier</span>
        </div>
      </div>

      {/* CUSTOMER DETAILS & HISTORY MODAL / DOSSIER */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {viewingCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{viewingCustomer.name}</h3>
                    <span className="font-mono text-xs text-slate-400">({viewingCustomer.id})</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        viewingCustomer.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {viewingCustomer.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Account: {viewingCustomer.accountNo} · Area: {viewingCustomer.area} · Mobile: {viewingCustomer.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintCustomerProfile(viewingCustomer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Profile</span>
                </button>
                <button
                  onClick={() => onReceivePaymentForCustomer(viewingCustomer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Payment</span>
                </button>
                <button
                  onClick={() => setViewingCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Balance Banner */}
            <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-500 block">Monthly Package:</span>
                  <span className="font-semibold text-slate-200">
                    {packages.find((p) => p.id === viewingCustomer.packageId)?.name || 'Custom'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Fee:</span>
                  <span className="font-mono text-slate-200">PKR {viewingCustomer.monthlyFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Billing Cycle:</span>
                  <span className="text-slate-200">{viewingCustomer.billingCycleDay}th of month</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Current Outstanding Balance:</span>
                <span
                  className={`text-base font-bold font-mono ${
                    viewingCustomer.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  PKR {viewingCustomer.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 text-xs">
              <button
                onClick={() => setDetailTab('profile')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'profile'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Network & Credentials
              </button>
              <button
                onClick={() => setDetailTab('invoices')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'invoices'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Invoices History
              </button>
              <button
                onClick={() => setDetailTab('payments')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'payments'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Payments Ledger
              </button>
              <button
                onClick={() => setDetailTab('complaints')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'complaints'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Complaints Log
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {detailTab === 'profile' && (
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-2.5">
                    <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider">
                      Subscriber Details
                    </h4>
                    <p><span className="text-slate-500">CNIC / ID:</span> <span className="font-mono text-slate-200 ml-2">{viewingCustomer.cnic}</span></p>
                    <p><span className="text-slate-500">Contact Number:</span> <span className="font-mono text-slate-200 ml-2">{viewingCustomer.phone}</span></p>
                    <p><span className="text-slate-500">Email Address:</span> <span className="text-slate-200 ml-2">{viewingCustomer.email || 'N/A'}</span></p>
                    <p><span className="text-slate-500">Installation Address:</span> <span className="text-slate-200 ml-2">{viewingCustomer.address}</span></p>
                    <p><span className="text-slate-500">Area Zone:</span> <span className="text-slate-200 ml-2 font-medium">{viewingCustomer.area}</span></p>
                    <p><span className="text-slate-500">Installation Date:</span> <span className="text-slate-200 ml-2">{viewingCustomer.installationDate}</span></p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-2.5">
                    <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider">
                      Technical Connection Specs
                    </h4>
                    <p><span className="text-slate-500">Line Type:</span> <span className="text-emerald-400 font-semibold ml-2">{viewingCustomer.serviceType}</span></p>
                    <p><span className="text-slate-500">PPPoE Username:</span> <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-white ml-2">{viewingCustomer.pppoeUsername}</span></p>
                    <p><span className="text-slate-500">ONU / ONT MAC:</span> <span className="font-mono text-slate-200 ml-2">{viewingCustomer.onuMac}</span></p>
                    <p><span className="text-slate-500">Allocated IP:</span> <span className="font-mono text-slate-200 ml-2">{viewingCustomer.ipAddress || 'DHCP Dynamic Pool'}</span></p>
                    <p><span className="text-slate-500">Installed Hardware:</span> <span className="text-slate-200 ml-2">{viewingCustomer.routerModel || 'Optical Terminal Unit'}</span></p>
                    {viewingCustomer.notes && (
                      <p className="pt-1 text-slate-400 italic"><span className="text-slate-500 not-italic">Operator Notes:</span> {viewingCustomer.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'invoices' && (
                <div className="space-y-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2">Invoice #</th>
                        <th className="py-2">Month</th>
                        <th className="py-2">Issue / Due Date</th>
                        <th className="py-2 text-right">Payable</th>
                        <th className="py-2 text-right">Paid</th>
                        <th className="py-2 text-right">Remaining</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {invoices
                        .filter((inv) => inv.customerId === viewingCustomer.id)
                        .map((inv) => (
                          <tr key={inv.id}>
                            <td className="py-2 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                            <td className="py-2 text-slate-300">{inv.billingMonth}</td>
                            <td className="py-2 text-slate-400">{inv.issueDate} / {inv.dueDate}</td>
                            <td className="py-2 text-right font-mono tabular-nums">PKR {inv.totalPayable.toLocaleString()}</td>
                            <td className="py-2 text-right font-mono tabular-nums text-emerald-400">PKR {inv.amountPaid.toLocaleString()}</td>
                            <td className="py-2 text-right font-mono tabular-nums text-rose-400">PKR {inv.remainingBalance.toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detailTab === 'payments' && (
                <div className="space-y-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2">Receipt #</th>
                        <th className="py-2">Payment Date</th>
                        <th className="py-2">Method</th>
                        <th className="py-2">Reference ID</th>
                        <th className="py-2 text-right">Amount</th>
                        <th className="py-2 text-right">Collector</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payments
                        .filter((p) => p.customerId === viewingCustomer.id)
                        .map((pay) => (
                          <tr key={pay.id}>
                            <td className="py-2 font-mono text-emerald-400 font-medium">{pay.receiptNumber}</td>
                            <td className="py-2 text-slate-300">{pay.paymentDate}</td>
                            <td className="py-2 uppercase text-slate-300">{pay.paymentMethod.replace('_', ' ')}</td>
                            <td className="py-2 font-mono text-slate-400">{pay.referenceNo || '-'}</td>
                            <td className="py-2 text-right font-mono tabular-nums font-bold text-white">
                              PKR {pay.amount.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-slate-400">{pay.collectorName}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detailTab === 'complaints' && (
                <div className="space-y-3">
                  {complaints.filter((c) => c.customerId === viewingCustomer.id).length === 0 ? (
                    <div className="text-center py-6 text-slate-500">No service complaints recorded for this customer.</div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {complaints
                        .filter((c) => c.customerId === viewingCustomer.id)
                        .map((tkt) => (
                          <div key={tkt.id} className="py-3 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white">{tkt.ticketNumber}</span>
                                <span className="uppercase text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                  {tkt.category.replace('_', ' ')}
                                </span>
                                <span className="text-slate-400">{new Date(tkt.registeredAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-300 mt-1">{tkt.description}</p>
                              {tkt.resolutionNotes && (
                                <p className="text-emerald-400 text-[11px] mt-1 bg-emerald-950/40 p-2 rounded border border-emerald-900/50">
                                  Resolution: {tkt.resolutionNotes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs uppercase font-semibold text-slate-300">{tkt.status}</span>
                              <div className="text-[10px] text-slate-500 mt-1">Tech: {tkt.assignedTechnicianName || 'None'}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="text-base font-bold text-white">
                {editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Register New Subscriber'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Muhammad Zeeshan"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Mobile / Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0300-1234567"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">CNIC / National ID</label>
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="35201-XXXXXXX-X"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Area / Zone *</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Gulberg III, Model Town"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Connection Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ConnectionStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Installation Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House #, Street #, Sector/Block, Landmark..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Package and Billing Info */}
              <div className="border-t border-slate-800 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                  Subscription & Billing Terms
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Internet Package</label>
                    <select
                      value={formData.packageId}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - PKR {pkg.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Monthly Fee (PKR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Billing Cycle Day</label>
                    <select
                      value={formData.billingCycleDay}
                      onChange={(e) => setFormData({ ...formData, billingCycleDay: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value={1}>1st of Month</option>
                      <option value={5}>5th of Month</option>
                      <option value={10}>10th of Month</option>
                      <option value={15}>15th of Month</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Network Specifications */}
              <div className="border-t border-slate-800 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-2">
                  Network & Service Parameters
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">PPPoE Username</label>
                    <input
                      type="text"
                      value={formData.pppoeUsername}
                      onChange={(e) => setFormData({ ...formData, pppoeUsername: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">ONU / ONT MAC</label>
                    <input
                      type="text"
                      value={formData.onuMac}
                      onChange={(e) => setFormData({ ...formData, onuMac: e.target.value })}
                      placeholder="XX:XX:XX:XX:XX:XX"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Static / Dedicated IP</label>
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                      placeholder="e.g. 182.185.120.45"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm transition-colors cursor-pointer"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
