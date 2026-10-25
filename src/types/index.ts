/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Type Definitions
 */

export type ConnectionStatus = 'active' | 'inactive' | 'suspended' | 'disconnected';

export type ServiceType = 'Fiber (GPON)' | 'Wireless PtP' | 'Ethernet LAN';

export interface InternetPackage {
  id: string;
  name: string;
  speedMbps: number;
  uploadMbps: number;
  price: number; // In PKR
  description: string;
  status: 'active' | 'inactive';
  popular?: boolean;
}

export interface Customer {
  id: string; // e.g. ATS-1001
  accountNo: string; // e.g. ACC-2026-001
  name: string;
  phone: string;
  cnic: string;
  email?: string;
  address: string;
  area: string; // e.g. Gulberg, Model Town, Cantt
  packageId: string;
  monthlyFee: number; // PKR
  installationDate: string; // YYYY-MM-DD
  billingCycleDay: number; // 1, 5, 10
  status: ConnectionStatus;
  serviceType: ServiceType;
  pppoeUsername: string;
  pppoePassword?: string;
  ipAddress?: string;
  onuMac: string;
  routerModel?: string;
  balance: number; // Outstanding dues in PKR (positive = dues, negative = advance)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'cancelled';

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string; // e.g. INV-2026-1001
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerAccountNo: string;
  billingMonth: string; // e.g. "October 2026" (YYYY-MM)
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  packageCharges: number;
  installationCharges: number;
  otherCharges: number;
  otherChargesDesc?: string;
  discount: number;
  previousDues: number;
  subtotal: number;
  lateFee: number;
  totalPayable: number;
  amountPaid: number;
  remainingBalance: number;
  status: InvoiceStatus;
  generatedBy: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'nayapay' | 'cheque';

export interface Payment {
  id: string; // PAY-2026-0001
  receiptNumber: string; // REC-2026-0001
  customerId: string;
  customerName: string;
  invoiceId?: string;
  amount: number; // PKR
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  referenceNo?: string; // Bank ref / transaction ID
  collectorName: string;
  notes?: string;
  status: 'completed' | 'cancelled';
  cancelledReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'internet_down'
  | 'slow_speed'
  | 'fiber_cut'
  | 'router_fault'
  | 'billing_issue'
  | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Complaint {
  id: string; // TKT-1042
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerArea: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  registeredAt: string; // ISO
  assignedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  registeredBy: string;
}

export interface Technician {
  id: string; // TECH-01
  name: string;
  phone: string;
  area: string;
  status: 'available' | 'on_field' | 'leave';
  skills: string[];
  activeJobsCount: number;
  completedJobsCount: number;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  pin: string; // for sensitive actions
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  category: 'billing' | 'customer' | 'complaint' | 'system' | 'security';
}

export interface LanSettings {
  mode: 'standalone' | 'lan_host' | 'lan_client';
  hostIp: string;
  port: number;
  sharedDatabasePath: string;
  stationName: string;
  autoBackupInterval: 'daily' | 'weekly' | 'manual';
  lastBackupDate?: string;
  simulatedClientCount: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'customers'
  | 'billing'
  | 'payments'
  | 'complaints'
  | 'technicians'
  | 'packages'
  | 'reports'
  | 'database_lan'
  | 'audit_log'
  | 'manual_install';

export interface PrintDocumentConfig {
  type: 'invoice' | 'receipt' | 'complaint' | 'customer_profile' | 'report';
  data: any;
  format?: 'a4' | 'thermal';
}
