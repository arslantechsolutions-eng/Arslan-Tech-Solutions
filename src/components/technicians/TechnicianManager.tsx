/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Technician Management Module
 */

import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Edit2,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  X,
  FileText,
  Award,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Technician, Complaint } from '../../types';

interface TechnicianManagerProps {
  onPrintWorkOrder: (complaint: Complaint) => void;
  currentUser: string;
}

export const TechnicianManager: React.FC<TechnicianManagerProps> = ({
  onPrintWorkOrder,
  currentUser,
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>(() => StorageService.getTechnicians());
  const complaints = StorageService.getComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [selectedTechJobs, setSelectedTechJobs] = useState<Technician | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    status: 'available' as Technician['status'],
    skills: 'Fiber Splicing, OTDR Testing, Router Setup',
  });

  const refreshData = () => {
    setTechnicians(StorageService.getTechnicians());
  };

  const openAddModal = () => {
    setEditingTech(null);
    setForm({
      name: '',
      phone: '',
      area: 'Model Town & Gulberg',
      status: 'available',
      skills: 'Fiber Splicing, GPON Setup, Cabling',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (tech: Technician) => {
    setEditingTech(tech);
    setForm({
      name: tech.name,
      phone: tech.phone,
      area: tech.area,
      status: tech.status,
      skills: tech.skills.join(', '),
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Please fill in technician name and contact number.');
      return;
    }

    const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingTech) {
      StorageService.updateTechnician(
        {
          ...editingTech,
          name: form.name,
          phone: form.phone,
          area: form.area,
          status: form.status,
          skills: skillsArray,
        },
        currentUser
      );
    } else {
      StorageService.addTechnician(
        {
          name: form.name,
          phone: form.phone,
          area: form.area,
          status: form.status,
          skills: skillsArray,
        },
        currentUser
      );
    }

    setIsAddModalOpen(false);
    refreshData();
  };

  const filteredTechnicians = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Field Workforce & Engineering</span>
            <span aria-hidden="true">·</span>
            <span>Active Technicians: {technicians.length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">On-Field Real-Time Allocation</span>
          </div>
          <h2 className="text-lg font-bold text-white">Technician Management & Performance</h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Technician</span>
        </button>
      </div>

      {/* Technicians Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTechnicians.map((tech) => {
          const techJobs = complaints.filter((c) => c.assignedTechnicianId === tech.id);
          const pendingJobs = techJobs.filter((c) => c.status !== 'resolved' && c.status !== 'closed');
          const resolvedJobs = techJobs.filter((c) => c.status === 'resolved' || c.status === 'closed');

          return (
            <div
              key={tech.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {tech.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{tech.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">{tech.id}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      tech.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : tech.status === 'on_field'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tech.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-slate-200">{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{tech.area}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                  {tech.skills.map((s, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded border border-slate-800 text-center text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Active Jobs</span>
                    <span className="font-bold font-mono text-amber-400">{pendingJobs.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Fixed</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {tech.completedJobsCount + resolvedJobs.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedTechJobs(tech)}
                    className="flex-1 py-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                  >
                    View Job Cards
                  </button>
                  <button
                    onClick={() => openEditModal(tech)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                    title="Edit Technician"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TECHNICIAN JOBS MODAL */}
      {selectedTechJobs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div>
                <h3 className="text-base font-bold text-white">
                  Field Assignments: {selectedTechJobs.name}
                </h3>
                <p className="text-xs text-slate-400">Contact: {selectedTechJobs.phone} · Area: {selectedTechJobs.area}</p>
              </div>
              <button onClick={() => setSelectedTechJobs(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3 text-xs">
              {complaints.filter((c) => c.assignedTechnicianId === selectedTechJobs.id).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No tickets currently assigned to this technician.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {complaints
                    .filter((c) => c.assignedTechnicianId === selectedTechJobs.id)
                    .map((tkt) => (
                      <div key={tkt.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{tkt.ticketNumber}</span>
                            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {tkt.priority}
                            </span>
                            <span className="text-slate-400">{tkt.category.replace('_', ' ')}</span>
                          </div>
                          <p className="font-semibold text-slate-200 mt-1">{tkt.customerName} ({tkt.customerArea})</p>
                          <p className="text-slate-400 text-[11px]">{tkt.description}</p>
                          {tkt.resolutionNotes && (
                            <p className="text-emerald-400 text-[11px] mt-1 bg-emerald-950/30 p-1.5 rounded">
                              Fix: {tkt.resolutionNotes}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0 space-y-1.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-300 block">{tkt.status}</span>
                          <button
                            onClick={() => onPrintWorkOrder(tkt)}
                            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Print Work Order</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setSelectedTechJobs(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TECHNICIAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="text-base font-bold text-white">
                {editingTech ? `Edit ${editingTech.name}` : 'Register Field Technician'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTechnician} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Technician Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Muhammad Rizwan"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Mobile Contact *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0301-1234567"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Assigned Operational Area *</label>
                <input
                  type="text"
                  required
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g. Gulberg, Cantt, Model Town"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Duty Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="available">Available at Office</option>
                  <option value="on_field">On Field / Dispatched</option>
                  <option value="leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Fiber Splicing, OTDR, Mikrotik"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Save Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
