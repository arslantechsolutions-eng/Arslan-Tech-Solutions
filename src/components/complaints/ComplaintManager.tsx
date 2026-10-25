/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Complaint & Helpdesk Ticketing Module
 */

import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  UserCheck,
  X,
  Phone,
  MapPin,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, Customer, Technician } from '../../types';

interface ComplaintManagerProps {
  onPrintWorkOrder: (complaint: Complaint) => void;
  currentUser: string;
}

export const ComplaintManager: React.FC<ComplaintManagerProps> = ({
  onPrintWorkOrder,
  currentUser,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => StorageService.getComplaints());
  const customers = StorageService.getCustomers();
  const technicians = StorageService.getTechnicians();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Register Form State
  const [newTicketForm, setNewTicketForm] = useState({
    customerId: customers[0]?.id || '',
    category: 'internet_down' as ComplaintCategory,
    priority: 'high' as ComplaintPriority,
    description: '',
    assignedTechnicianId: '',
  });

  const refreshData = () => {
    setComplaints(StorageService.getComplaints());
  };

  const selectedCustomerObj = customers.find((c) => c.id === newTicketForm.customerId);

  const openRegisterModal = () => {
    setNewTicketForm({
      customerId: customers[0]?.id || '',
      category: 'internet_down',
      priority: 'high',
      description: '',
      assignedTechnicianId: '',
    });
    setIsRegisterModalOpen(true);
  };

  const handleRegisterTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.customerId) {
      alert('Please select a customer.');
      return;
    }
    if (!newTicketForm.description.trim()) {
      alert('Please enter a description of the customer issue.');
      return;
    }

    try {
      const ticket = StorageService.addComplaint(
        {
          customerId: newTicketForm.customerId,
          category: newTicketForm.category,
          priority: newTicketForm.priority,
          description: newTicketForm.description,
          assignedTechnicianId: newTicketForm.assignedTechnicianId || undefined,
        },
        currentUser
      );

      setIsRegisterModalOpen(false);
      refreshData();
      if (confirm(`Ticket #${ticket.ticketNumber} registered successfully! Print technician work order job card now?`)) {
        onPrintWorkOrder(ticket);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveTechnicianAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedTechId) return;

    StorageService.assignTechnicianToComplaint(assigningComplaint.id, selectedTechId, currentUser);
    setAssigningComplaint(null);
    setSelectedTechId('');
    refreshData();
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution remarks.');
      return;
    }

    StorageService.updateComplaintStatus(resolvingComplaint.id, 'resolved', resolutionNotes, currentUser);
    setResolvingComplaint(null);
    setResolutionNotes('');
    refreshData();
  };

  // Filtered Complaints
  const filteredComplaints = complaints.filter((tkt) => {
    const matchesSearch =
      tkt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.customerPhone.includes(searchQuery) ||
      tkt.customerArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || tkt.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || tkt.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || tkt.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // KPI calculations
  const totalOpenOrAssigned = complaints.filter(
    (c) => c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress'
  ).length;
  const totalUrgent = complaints.filter((c) => c.priority === 'urgent' && c.status !== 'resolved').length;
  const totalResolved = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <div className="space-y-5">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Customer Technical Care & Dispatch</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-semibold">Active Unresolved: {totalOpenOrAssigned}</span>
            <span aria-hidden="true">·</span>
            <span>Resolved: {totalResolved}</span>
          </div>
          <h2 className="text-lg font-bold text-white">Complaint Ticketing & Field Dispatch</h2>
        </div>

        <button
          onClick={openRegisterModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Ticket (F4)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Pending / In Progress</span>
            <span className="text-lg font-bold font-mono tabular-nums text-amber-400">
              {totalOpenOrAssigned} Tickets
            </span>
          </div>
          <Clock className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Urgent Priority (Fiber Cuts)</span>
            <span className="text-lg font-bold font-mono tabular-nums text-rose-400">
              {totalUrgent} High Severity
            </span>
          </div>
          <AlertOctagon className="w-6 h-6 text-rose-400 opacity-60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Successfully Resolved</span>
            <span className="text-lg font-bold font-mono tabular-nums text-emerald-400">
              {totalResolved} Fixed
            </span>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ticket #, Customer Name, Phone, Area, or Issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="open" className="bg-slate-900">Open / Unassigned</option>
              <option value="assigned" className="bg-slate-900">Assigned</option>
              <option value="in_progress" className="bg-slate-900">In Progress</option>
              <option value="resolved" className="bg-slate-900">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Priorities</option>
              <option value="urgent" className="bg-slate-900">Urgent</option>
              <option value="high" className="bg-slate-900">High</option>
              <option value="medium" className="bg-slate-900">Medium</option>
              <option value="low" className="bg-slate-900">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              <option value="internet_down" className="bg-slate-900">Internet Down</option>
              <option value="slow_speed" className="bg-slate-900">Slow Speed</option>
              <option value="fiber_cut" className="bg-slate-900">Fiber Cut / LOS</option>
              <option value="router_fault" className="bg-slate-900">Router / Device Issue</option>
              <option value="billing_issue" className="bg-slate-900">Billing Complaint</option>
              <option value="other" className="bg-slate-900">Other Technical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Ticket #</th>
                <th className="py-3 px-4">Customer & Area</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Assigned Field Tech</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No complaints found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {tkt.ticketNumber}
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tkt.registeredAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{tkt.customerName}</div>
                      <div className="text-[11px] text-slate-400">{tkt.customerArea} · {tkt.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-slate-300 font-medium">
                        {tkt.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          tkt.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : tkt.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      <p className="line-clamp-2">{tkt.description}</p>
                      {tkt.resolutionNotes && (
                        <p className="text-[10px] text-emerald-400 mt-0.5 line-clamp-1">
                          Fix: {tkt.resolutionNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {tkt.assignedTechnicianName ? (
                        <div className="font-medium text-emerald-400">{tkt.assignedTechnicianName}</div>
                      ) : (
                        <button
                          onClick={() => {
                            setAssigningComplaint(tkt);
                            setSelectedTechId(technicians[0]?.id || '');
                          }}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 cursor-pointer"
                        >
                          + Assign Tech
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          tkt.status === 'resolved' || tkt.status === 'closed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tkt.status === 'in_progress'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : tkt.status === 'assigned'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tkt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPrintWorkOrder(tkt)}
                          title="Print Technician Work Order Job Card"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {tkt.status !== 'resolved' && tkt.status !== 'closed' && (
                          <button
                            onClick={() => {
                              setResolvingComplaint(tkt);
                              setResolutionNotes('');
                            }}
                            title="Mark as Resolved"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
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
          <span>{filteredComplaints.length} tickets recorded</span>
          <span>Field technicians can be directly assigned with printed Job Cards</span>
        </div>
      </div>

      {/* REGISTER NEW COMPLAINT MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Register Customer Complaint Ticket</h3>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTicket} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Affected Customer *</label>
                <select
                  value={newTicketForm.customerId}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, customerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id} - {c.area}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerObj && (
                <div className="bg-slate-950 p-2.5 border border-slate-800 rounded text-[11px] text-slate-400 space-y-0.5">
                  <div>Address: <strong className="text-slate-300">{selectedCustomerObj.address}</strong></div>
                  <div>PPPoE / ONU MAC: <span className="font-mono text-slate-300">{selectedCustomerObj.pppoeUsername} · {selectedCustomerObj.onuMac}</span></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Complaint Category *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as ComplaintCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="internet_down">Internet Disconnection</option>
                    <option value="slow_speed">Slow Speed / High Latency</option>
                    <option value="fiber_cut">Fiber Break / Optical LOS</option>
                    <option value="router_fault">Router or ONU Device Fault</option>
                    <option value="billing_issue">Billing / Payment Dispute</option>
                    <option value="other">Other Technical Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Ticket Priority *</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as ComplaintPriority })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="urgent">Urgent (Immediate Field Visit)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Assign Field Technician (Optional)</label>
                <select
                  value={newTicketForm.assignedTechnicianId}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, assignedTechnicianId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="">-- Leave Unassigned (Dispatch Later) --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.area}) - {t.activeJobsCount} Active Jobs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Detailed Problem Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  placeholder="e.g. Red PON/LOS blinking on Huawei ONU since 2 PM. Customer checked power adapter."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Register Ticket & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="text-base font-bold text-white">Assign Technician to Ticket</h3>
              <button onClick={() => setAssigningComplaint(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTechnicianAssignment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div>Ticket: <strong className="font-mono text-white">{assigningComplaint.ticketNumber}</strong></div>
                <div>Customer: <strong className="text-white">{assigningComplaint.customerName}</strong></div>
                <div>Area: <strong className="text-slate-300">{assigningComplaint.customerArea}</strong></div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Field Technician *</label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.area}) - {t.activeJobsCount} Active Jobs
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Assign Field Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE COMPLAINT MODAL */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Resolve Complaint Ticket</h3>
              </div>
              <button onClick={() => setResolvingComplaint(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div>Ticket: <strong className="font-mono text-white">{resolvingComplaint.ticketNumber}</strong></div>
                <div>Customer: <strong className="text-white">{resolvingComplaint.customerName}</strong></div>
                <div>Reported Issue: <span className="text-slate-400">{resolvingComplaint.description}</span></div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Technician Resolution Remarks *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Spliced core fiber cable at pole joint #3. Optical power reading is now -18.4 dBm. Verified internet ping."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
