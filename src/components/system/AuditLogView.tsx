/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - System Security & Financial Audit Log Viewer
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  Lock,
  Download,
  Clock,
  User,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { AuditLog } from '../../types';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const exportAuditCSV = () => {
    if (!filteredLogs.length) return;
    const headers = ['Timestamp', 'User', 'Action', 'Category', 'Details'];
    const rows = filteredLogs.map((l) => [
      JSON.stringify(l.timestamp),
      JSON.stringify(l.username),
      JSON.stringify(l.action),
      JSON.stringify(l.category),
      JSON.stringify(l.details),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Title & Action Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Security Governance & Traceability</span>
            <span aria-hidden="true">·</span>
            <span>Recorded Audit Entries: {logs.length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Tamper-Evident Local Log</span>
          </div>
          <h2 className="text-lg font-bold text-white">System Security & Financial Audit Trail</h2>
        </div>

        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, details, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2 py-1 rounded-md text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Categories</option>
            <option value="billing" className="bg-slate-900">Billing & Payments</option>
            <option value="customer" className="bg-slate-900">Customer Records</option>
            <option value="complaint" className="bg-slate-900">Complaints & Tickets</option>
            <option value="security" className="bg-slate-900">Security & Logins</option>
            <option value="system" className="bg-slate-900">System & Database</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Authorized User</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Transaction / Change Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No audit records found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-white whitespace-nowrap">
                      {log.username}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium text-emerald-400 text-[11px] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
