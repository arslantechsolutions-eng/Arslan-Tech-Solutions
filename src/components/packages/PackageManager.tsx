/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Internet Package Management Module
 */

import React, { useState } from 'react';
import {
  Wifi,
  Plus,
  Edit2,
  CheckCircle,
  Users,
  Gauge,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  ShieldCheck,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { InternetPackage } from '../../types';

interface PackageManagerProps {
  currentUser: string;
}

export const PackageManager: React.FC<PackageManagerProps> = ({ currentUser }) => {
  const [packages, setPackages] = useState<InternetPackage[]>(() => StorageService.getPackages());
  const customers = StorageService.getCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<InternetPackage | null>(null);

  const [form, setForm] = useState({
    name: '',
    speedMbps: 30,
    uploadMbps: 30,
    price: 2200,
    description: 'High-speed optical fiber connection with unlimited data transfer.',
    status: 'active' as 'active' | 'inactive',
    popular: false,
  });

  const refreshData = () => {
    setPackages(StorageService.getPackages());
  };

  const openAddModal = () => {
    setEditingPackage(null);
    setForm({
      name: 'Fiber Gold 40M',
      speedMbps: 40,
      uploadMbps: 40,
      price: 2800,
      description: 'Dedicated gigabit fiber with low gaming ping and buffer-free HD streaming.',
      status: 'active',
      popular: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: InternetPackage) => {
    setEditingPackage(pkg);
    setForm({
      name: pkg.name,
      speedMbps: pkg.speedMbps,
      uploadMbps: pkg.uploadMbps,
      price: pkg.price,
      description: pkg.description,
      status: pkg.status,
      popular: !!pkg.popular,
    });
    setIsModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      alert('Please provide package name and valid monthly fee.');
      return;
    }

    if (editingPackage) {
      StorageService.updatePackage(
        {
          ...editingPackage,
          ...form,
        },
        currentUser
      );
    } else {
      StorageService.addPackage(form, currentUser);
    }

    setIsModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-5">
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Bandwidth Tariffs & Plans</span>
            <span aria-hidden="true">·</span>
            <span>Total Packages: {packages.length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Historical Invoices Untouched by Tariff Edits</span>
          </div>
          <h2 className="text-lg font-bold text-white">Internet Package Management</h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const subscriberCount = customers.filter((c) => c.packageId === pkg.id).length;
          const monthlyVolume = subscriberCount * pkg.price;

          return (
            <div
              key={pkg.id}
              className={`bg-slate-900 border rounded-lg p-5 space-y-4 flex flex-col justify-between transition-colors ${
                pkg.popular
                  ? 'border-emerald-500/50 shadow-emerald-950/20 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">{pkg.id}</span>
                    <h3 className="font-bold text-base text-white mt-0.5">{pkg.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pkg.popular && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                        Popular
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        pkg.status === 'active'
                          ? 'bg-slate-800 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>
                </div>

                {/* Speed & Price Callout */}
                <div className="mt-4 flex items-baseline justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                      PKR {pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ month</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-white flex items-center justify-end gap-1">
                      <Gauge className="w-4 h-4 text-sky-400" />
                      {pkg.speedMbps} Mbps
                    </span>
                    <span className="text-[11px] text-slate-500">Symmetric Fiber</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed min-h-[40px]">
                  {pkg.description}
                </p>

                {/* Technical specs strip */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download: <strong className="text-slate-200">{pkg.speedMbps} Mbps</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload: <strong className="text-slate-200">{pkg.uploadMbps} Mbps</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-medium">{subscriberCount} Subscribers</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-slate-400 font-semibold">
                      PKR {monthlyVolume.toLocaleString()} / mo
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Tariff Rate</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT PACKAGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="text-base font-bold text-white">
                {editingPackage ? `Edit Plan: ${editingPackage.name}` : 'Create New Internet Package'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Package Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ultra Family 35 Mbps"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Download Speed (Mbps) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.speedMbps}
                    onChange={(e) => setForm({ ...form, speedMbps: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Upload Speed (Mbps) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.uploadMbps}
                    onChange={(e) => setForm({ ...form, uploadMbps: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Monthly Fee (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm font-bold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Package Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="active">Active (Available for Assignment)</option>
                    <option value="inactive">Inactive / Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Plan Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Marketing features, ping SLA, data caps..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={form.popular}
                  onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700"
                />
                <label htmlFor="popularCheck" className="text-slate-300 cursor-pointer">
                  Mark as "Most Popular / Recommended" plan
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm cursor-pointer"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
