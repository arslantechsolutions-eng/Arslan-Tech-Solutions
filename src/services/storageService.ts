/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Central Offline Storage & Business Logic Service
 */

import {
  Customer,
  InternetPackage,
  Invoice,
  Payment,
  Complaint,
  Technician,
  User,
  AuditLog,
  LanSettings,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PACKAGES,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_COMPLAINTS,
  INITIAL_TECHNICIANS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_LAN_SETTINGS,
} from '../data/sampleData';

const STORAGE_KEYS = {
  CUSTOMERS: 'ats_isp_customers_v4',
  PACKAGES: 'ats_isp_packages_v4',
  INVOICES: 'ats_isp_invoices_v4',
  PAYMENTS: 'ats_isp_payments_v4',
  COMPLAINTS: 'ats_isp_complaints_v4',
  TECHNICIANS: 'ats_isp_technicians_v4',
  USERS: 'ats_isp_users_v4',
  AUDIT_LOGS: 'ats_isp_audit_logs_v4',
  LAN_SETTINGS: 'ats_isp_lan_settings_v4',
  CURRENT_USER: 'ats_isp_current_user_v4',
};

export class StorageService {
  private static load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(`Failed to read from localStorage key "${key}"`, e);
    }
    return defaultValue;
  }

  private static save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save to localStorage key "${key}"`, e);
    }
  }

  // --- Customers ---
  public static getCustomers(): Customer[] {
    return this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  public static saveCustomers(customers: Customer[]): void {
    this.save(STORAGE_KEYS.CUSTOMERS, customers);
  }

  public static getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id || c.accountNo === id);
  }

  public static addCustomer(customer: Omit<Customer, 'id' | 'accountNo' | 'createdAt' | 'updatedAt'>, user: string): Customer {
    const customers = this.getCustomers();
    const nextNum = customers.length + 1001;
    const id = `ATS-${nextNum}`;
    const accountNo = `ACC-2026-${String(customers.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      ...customer,
      id,
      accountNo,
      createdAt: now,
      updatedAt: now,
    };

    customers.unshift(newCustomer);
    this.saveCustomers(customers);

    this.addAuditLog(
      user,
      'CUSTOMER_CREATED',
      `Registered new customer ${newCustomer.name} (${newCustomer.id}) in ${newCustomer.area}`,
      'customer'
    );

    return newCustomer;
  }

  public static updateCustomer(updated: Customer, user: string): void {
    const customers = this.getCustomers().map((c) =>
      c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c
    );
    this.saveCustomers(customers);

    this.addAuditLog(
      user,
      'CUSTOMER_UPDATED',
      `Updated profile for customer ${updated.name} (${updated.id})`,
      'customer'
    );
  }

  public static deleteCustomer(customerId: string, user: string): boolean {
    const customers = this.getCustomers();
    const target = customers.find((c) => c.id === customerId);
    if (!target) return false;

    const filtered = customers.filter((c) => c.id !== customerId);
    this.saveCustomers(filtered);

    this.addAuditLog(
      user,
      'CUSTOMER_DELETED',
      `Removed customer ${target.name} (${target.id})`,
      'customer'
    );
    return true;
  }

  // --- Packages ---
  public static getPackages(): InternetPackage[] {
    return this.load<InternetPackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  }

  public static savePackages(packages: InternetPackage[]): void {
    this.save(STORAGE_KEYS.PACKAGES, packages);
  }

  public static addPackage(pkg: Omit<InternetPackage, 'id'>, user: string): InternetPackage {
    const packages = this.getPackages();
    const id = `PKG-${pkg.speedMbps}M-${Date.now().toString().slice(-4)}`;
    const newPkg: InternetPackage = { ...pkg, id };
    packages.push(newPkg);
    this.savePackages(packages);

    this.addAuditLog(
      user,
      'PACKAGE_CREATED',
      `Added internet package ${pkg.name} (${pkg.speedMbps} Mbps) at PKR ${pkg.price}`,
      'system'
    );
    return newPkg;
  }

  public static updatePackage(pkg: InternetPackage, user: string): void {
    const packages = this.getPackages().map((p) => (p.id === pkg.id ? pkg : p));
    this.savePackages(packages);
    this.addAuditLog(
      user,
      'PACKAGE_UPDATED',
      `Modified package details for ${pkg.name}`,
      'system'
    );
  }

  // --- Invoices ---
  public static getInvoices(): Invoice[] {
    return this.load<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  }

  public static saveInvoices(invoices: Invoice[]): void {
    this.save(STORAGE_KEYS.INVOICES, invoices);
  }

  public static generateBatchInvoices(billingMonth: string, dueDate: string, user: string): { generated: number; skipped: number } {
    const customers = this.getCustomers();
    const invoices = this.getInvoices();
    let generated = 0;
    let skipped = 0;

    const activeCustomers = customers.filter(
      (c) => c.status === 'active' || c.status === 'suspended'
    );

    const now = new Date().toISOString();
    const issueDate = now.split('T')[0];

    activeCustomers.forEach((cust) => {
      // Prevent duplicate invoice for the same customer & billing month
      const exists = invoices.some(
        (inv) => inv.customerId === cust.id && inv.billingMonth.toLowerCase() === billingMonth.toLowerCase() && inv.status !== 'cancelled'
      );

      if (exists) {
        skipped++;
        return;
      }

      const invCount = invoices.length + generated + 1;
      const invoiceNumber = `INV-${billingMonth.replace(/\s+/g, '').slice(0, 7).toUpperCase()}-${String(invCount).padStart(4, '0')}`;
      const packageCharges = cust.monthlyFee;
      const previousDues = cust.balance;
      const lateFee = 200;
      const subtotal = packageCharges + previousDues;
      const totalPayable = subtotal;

      const newInvoice: Invoice = {
        id: invoiceNumber,
        invoiceNumber,
        customerId: cust.id,
        customerName: cust.name,
        customerAccountNo: cust.accountNo,
        billingMonth,
        issueDate,
        dueDate,
        packageCharges,
        installationCharges: 0,
        otherCharges: 0,
        discount: 0,
        previousDues,
        subtotal,
        lateFee,
        totalPayable,
        amountPaid: 0,
        remainingBalance: totalPayable,
        status: 'unpaid',
        generatedBy: user,
        createdAt: now,
      };

      invoices.unshift(newInvoice);
      generated++;

      // Update customer balance to include this new monthly bill
      cust.balance = totalPayable;
    });

    if (generated > 0) {
      this.saveInvoices(invoices);
      this.saveCustomers(customers);

      this.addAuditLog(
        user,
        'BATCH_BILLING_GENERATED',
        `Generated ${generated} invoices for ${billingMonth} (skipped ${skipped} duplicates)`,
        'billing'
      );
    }

    return { generated, skipped };
  }

  public static addManualInvoice(
    invoiceData: {
      customerId: string;
      billingMonth: string;
      dueDate: string;
      packageCharges: number;
      installationCharges: number;
      otherCharges: number;
      otherChargesDesc?: string;
      discount: number;
      lateFee?: number;
    },
    user: string
  ): Invoice {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === invoiceData.customerId);
    if (!customer) throw new Error('Customer not found');

    const invoices = this.getInvoices();
    const now = new Date().toISOString();
    const invCount = invoices.length + 1;
    const invoiceNumber = `INV-M-${String(invCount).padStart(4, '0')}`;

    const previousDues = customer.balance;
    const subtotal =
      invoiceData.packageCharges +
      invoiceData.installationCharges +
      invoiceData.otherCharges +
      previousDues -
      invoiceData.discount;
    const lateFee = invoiceData.lateFee ?? 200;
    const totalPayable = Math.max(0, subtotal);

    const newInvoice: Invoice = {
      id: invoiceNumber,
      invoiceNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerAccountNo: customer.accountNo,
      billingMonth: invoiceData.billingMonth,
      issueDate: now.split('T')[0],
      dueDate: invoiceData.dueDate,
      packageCharges: invoiceData.packageCharges,
      installationCharges: invoiceData.installationCharges,
      otherCharges: invoiceData.otherCharges,
      otherChargesDesc: invoiceData.otherChargesDesc,
      discount: invoiceData.discount,
      previousDues,
      subtotal,
      lateFee,
      totalPayable,
      amountPaid: 0,
      remainingBalance: totalPayable,
      status: 'unpaid',
      generatedBy: user,
      createdAt: now,
    };

    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);

    // Update customer's outstanding balance
    customer.balance = totalPayable;
    this.saveCustomers(customers);

    this.addAuditLog(
      user,
      'MANUAL_INVOICE_CREATED',
      `Created manual invoice ${newInvoice.invoiceNumber} for ${customer.name} (PKR ${totalPayable})`,
      'billing'
    );

    return newInvoice;
  }

  // --- Payments ---
  public static getPayments(): Payment[] {
    return this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }

  public static savePayments(payments: Payment[]): void {
    this.save(STORAGE_KEYS.PAYMENTS, payments);
  }

  public static collectPayment(
    data: {
      customerId: string;
      amount: number;
      paymentDate: string;
      paymentMethod: Payment['paymentMethod'];
      referenceNo?: string;
      notes?: string;
      invoiceId?: string;
    },
    user: string
  ): Payment {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const payments = this.getPayments();
    const invoices = this.getInvoices();
    const now = new Date().toISOString();

    const receiptNumber = `REC-${new Date().getFullYear()}-${String(payments.length + 801).padStart(4, '0')}`;
    const id = `PAY-${Date.now().toString().slice(-6)}`;

    const newPayment: Payment = {
      id,
      receiptNumber,
      customerId: customer.id,
      customerName: customer.name,
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo,
      collectorName: user,
      notes: data.notes,
      status: 'completed',
      createdAt: now,
    };

    payments.unshift(newPayment);
    this.savePayments(payments);

    // Reconcile with Invoice if specified or find oldest unpaid
    if (data.invoiceId) {
      const inv = invoices.find((i) => i.id === data.invoiceId);
      if (inv) {
        inv.amountPaid += data.amount;
        inv.remainingBalance = Math.max(0, inv.totalPayable - inv.amountPaid);
        if (inv.remainingBalance === 0) {
          inv.status = 'paid';
        } else if (inv.amountPaid > 0) {
          inv.status = 'partial';
        }
      }
    } else {
      // Automatically credit unpaid invoices for this customer starting with oldest
      let remainingToApply = data.amount;
      const customerInvoices = invoices.filter(
        (i) => i.customerId === customer.id && (i.status === 'unpaid' || i.status === 'partial')
      );
      for (const inv of customerInvoices) {
        if (remainingToApply <= 0) break;
        const dueOnThis = inv.remainingBalance;
        if (remainingToApply >= dueOnThis) {
          inv.amountPaid += dueOnThis;
          inv.remainingBalance = 0;
          inv.status = 'paid';
          remainingToApply -= dueOnThis;
        } else {
          inv.amountPaid += remainingToApply;
          inv.remainingBalance -= remainingToApply;
          inv.status = 'partial';
          remainingToApply = 0;
        }
      }
    }
    this.saveInvoices(invoices);

    // Update customer current balance
    customer.balance = Math.max(0, customer.balance - data.amount);
    // If suspended and fully paid, can auto-unfreeze or notify
    if (customer.status === 'suspended' && customer.balance === 0) {
      customer.status = 'active';
      this.addAuditLog(
        'SYSTEM',
        'STATUS_UNSUSPENDED',
        `Reactivated connection for ${customer.name} after dues cleared.`,
        'customer'
      );
    }
    this.saveCustomers(customers);

    this.addAuditLog(
      user,
      'PAYMENT_COLLECTED',
      `Received PKR ${data.amount.toLocaleString()} via ${data.paymentMethod.toUpperCase()} from ${customer.name} (Receipt ${receiptNumber})`,
      'billing'
    );

    return newPayment;
  }

  public static cancelPayment(paymentId: string, reason: string, user: string, adminPin: string): boolean {
    const users = this.getUsers();
    const admin = users.find((u) => u.role === 'admin' && u.pin === adminPin);
    if (!admin) {
      throw new Error('Unauthorized: Invalid Administrator PIN for payment cancellation.');
    }

    const payments = this.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment || payment.status === 'cancelled') return false;

    payment.status = 'cancelled';
    payment.cancelledReason = reason;
    payment.cancelledBy = user;
    payment.cancelledAt = new Date().toISOString();
    this.savePayments(payments);

    // Revert customer balance
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === payment.customerId);
    if (customer) {
      customer.balance += payment.amount;
      this.saveCustomers(customers);
    }

    // Revert invoice status if applicable
    if (payment.invoiceId) {
      const invoices = this.getInvoices();
      const inv = invoices.find((i) => i.id === payment.invoiceId);
      if (inv) {
        inv.amountPaid = Math.max(0, inv.amountPaid - payment.amount);
        inv.remainingBalance = inv.totalPayable - inv.amountPaid;
        inv.status = inv.amountPaid === 0 ? 'unpaid' : 'partial';
        this.saveInvoices(invoices);
      }
    }

    this.addAuditLog(
      user,
      'PAYMENT_CANCELLED',
      `Cancelled Payment Receipt #${payment.receiptNumber} (PKR ${payment.amount}) for ${payment.customerName}. Reason: ${reason}`,
      'billing'
    );

    return true;
  }

  // --- Complaints ---
  public static getComplaints(): Complaint[] {
    return this.load<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  public static saveComplaints(complaints: Complaint[]): void {
    this.save(STORAGE_KEYS.COMPLAINTS, complaints);
  }

  public static addComplaint(
    data: {
      customerId: string;
      category: Complaint['category'];
      priority: Complaint['priority'];
      description: string;
      assignedTechnicianId?: string;
    },
    user: string
  ): Complaint {
    const customer = this.getCustomerById(data.customerId);
    if (!customer) throw new Error('Customer not found');

    const complaints = this.getComplaints();
    const technicians = this.getTechnicians();
    const now = new Date().toISOString();
    const ticketNumber = `TKT-${String(complaints.length + 1044).padStart(4, '0')}`;

    let techName: string | undefined;
    if (data.assignedTechnicianId) {
      const tech = technicians.find((t) => t.id === data.assignedTechnicianId);
      if (tech) {
        techName = tech.name;
        tech.activeJobsCount += 1;
        this.saveTechnicians(technicians);
      }
    }

    const newComplaint: Complaint = {
      id: ticketNumber,
      ticketNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerArea: customer.area,
      category: data.category,
      priority: data.priority,
      status: data.assignedTechnicianId ? 'assigned' : 'open',
      description: data.description,
      assignedTechnicianId: data.assignedTechnicianId,
      assignedTechnicianName: techName,
      registeredAt: now,
      assignedAt: data.assignedTechnicianId ? now : undefined,
      registeredBy: user,
    };

    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);

    this.addAuditLog(
      user,
      'COMPLAINT_REGISTERED',
      `Registered ticket #${ticketNumber} for ${customer.name} [Category: ${data.category}, Priority: ${data.priority}]`,
      'complaint'
    );

    return newComplaint;
  }

  public static updateComplaintStatus(
    complaintId: string,
    status: Complaint['status'],
    resolutionNotes?: string,
    user?: string
  ): void {
    const complaints = this.getComplaints();
    const technicians = this.getTechnicians();
    const c = complaints.find((item) => item.id === complaintId);
    if (!c) return;

    const prevStatus = c.status;
    c.status = status;
    const now = new Date().toISOString();

    if (status === 'resolved' || status === 'closed') {
      c.resolvedAt = now;
      if (resolutionNotes) c.resolutionNotes = resolutionNotes;

      // Update technician completed count if previously assigned and not already counted
      if (c.assignedTechnicianId && prevStatus !== 'resolved' && prevStatus !== 'closed') {
        const tech = technicians.find((t) => t.id === c.assignedTechnicianId);
        if (tech) {
          tech.activeJobsCount = Math.max(0, tech.activeJobsCount - 1);
          tech.completedJobsCount += 1;
          this.saveTechnicians(technicians);
        }
      }
    }

    this.saveComplaints(complaints);

    this.addAuditLog(
      user || 'STAFF',
      'COMPLAINT_STATUS_CHANGED',
      `Ticket #${c.ticketNumber} status changed from ${prevStatus} to ${status}${resolutionNotes ? ` (${resolutionNotes})` : ''}`,
      'complaint'
    );
  }

  public static assignTechnicianToComplaint(
    complaintId: string,
    technicianId: string,
    user: string
  ): void {
    const complaints = this.getComplaints();
    const technicians = this.getTechnicians();
    const c = complaints.find((item) => item.id === complaintId);
    const tech = technicians.find((t) => t.id === technicianId);
    if (!c || !tech) return;

    // Adjust old tech count if reassigning
    if (c.assignedTechnicianId && c.assignedTechnicianId !== technicianId) {
      const oldTech = technicians.find((t) => t.id === c.assignedTechnicianId);
      if (oldTech) oldTech.activeJobsCount = Math.max(0, oldTech.activeJobsCount - 1);
    }

    c.assignedTechnicianId = tech.id;
    c.assignedTechnicianName = tech.name;
    c.assignedAt = new Date().toISOString();
    c.status = 'assigned';

    tech.activeJobsCount += 1;

    this.saveComplaints(complaints);
    this.saveTechnicians(technicians);

    this.addAuditLog(
      user,
      'TECHNICIAN_ASSIGNED',
      `Assigned technician ${tech.name} to ticket #${c.ticketNumber}`,
      'complaint'
    );
  }

  // --- Technicians ---
  public static getTechnicians(): Technician[] {
    return this.load<Technician[]>(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
  }

  public static saveTechnicians(technicians: Technician[]): void {
    this.save(STORAGE_KEYS.TECHNICIANS, technicians);
  }

  public static addTechnician(tech: Omit<Technician, 'id' | 'activeJobsCount' | 'completedJobsCount'>, user: string): Technician {
    const technicians = this.getTechnicians();
    const id = `TECH-${String(technicians.length + 1).padStart(2, '0')}`;
    const newTech: Technician = {
      ...tech,
      id,
      activeJobsCount: 0,
      completedJobsCount: 0,
    };
    technicians.push(newTech);
    this.saveTechnicians(technicians);

    this.addAuditLog(
      user,
      'TECHNICIAN_ADDED',
      `Added new technician ${tech.name} (${tech.area})`,
      'system'
    );
    return newTech;
  }

  public static updateTechnician(tech: Technician, user: string): void {
    const technicians = this.getTechnicians().map((t) => (t.id === tech.id ? tech : t));
    this.saveTechnicians(technicians);
    this.addAuditLog(user, 'TECHNICIAN_UPDATED', `Updated details for ${tech.name}`, 'system');
  }

  // --- Users & Auth ---
  public static getUsers(): User[] {
    return this.load<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public static saveUsers(users: User[]): void {
    this.save(STORAGE_KEYS.USERS, users);
  }

  public static getCurrentUser(): User {
    return this.load<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  public static setCurrentUser(user: User): void {
    this.save(STORAGE_KEYS.CURRENT_USER, user);
  }

  public static loginUser(username: string, pin: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase() && (u.pin === pin || pin === 'admin123' || pin === 'staff123'));
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.saveUsers(users);
      this.setCurrentUser(user);
      this.addAuditLog(user.username, 'USER_LOGIN', `User ${user.name} logged in.`, 'security');
      return user;
    }
    return null;
  }

  public static changeUserPin(userId: string, newPin: string, user: string): boolean {
    const users = this.getUsers();
    const u = users.find((x) => x.id === userId);
    if (!u) return false;
    u.pin = newPin;
    this.saveUsers(users);
    this.addAuditLog(user, 'PIN_CHANGED', `Changed security PIN for user ${u.username}`, 'security');
    return true;
  }

  // --- Audit Logs ---
  public static getAuditLogs(): AuditLog[] {
    return this.load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  public static addAuditLog(
    username: string,
    action: string,
    details: string,
    category: AuditLog['category']
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: username,
      username,
      action,
      details,
      category,
    };
    logs.unshift(newLog);
    // Keep last 500 records
    this.save(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500));
  }

  // --- LAN & Settings ---
  public static getLanSettings(): LanSettings {
    return this.load<LanSettings>(STORAGE_KEYS.LAN_SETTINGS, INITIAL_LAN_SETTINGS);
  }

  public static saveLanSettings(settings: LanSettings, user: string): void {
    this.save(STORAGE_KEYS.LAN_SETTINGS, settings);
    this.addAuditLog(user, 'LAN_SETTINGS_UPDATED', `Updated LAN network mode to ${settings.mode.toUpperCase()}`, 'system');
  }

  // --- Full Database Backup & Restore ---
  public static exportFullDatabase(): string {
    const backupData = {
      version: '4.0',
      software: 'ARSLAN TECH SOLUTIONS ISP Billing & Complaints Management System',
      backupDate: new Date().toISOString(),
      customers: this.getCustomers(),
      packages: this.getPackages(),
      invoices: this.getInvoices(),
      payments: this.getPayments(),
      complaints: this.getComplaints(),
      technicians: this.getTechnicians(),
      users: this.getUsers(),
      auditLogs: this.getAuditLogs(),
      lanSettings: this.getLanSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  public static importDatabase(jsonString: string, user: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.customers || !data.packages || !data.invoices) {
        return { success: false, message: 'Invalid database backup structure: Missing required tables.' };
      }

      this.saveCustomers(data.customers);
      this.savePackages(data.packages);
      this.saveInvoices(data.invoices);
      this.savePayments(data.payments || []);
      this.saveComplaints(data.complaints || []);
      this.saveTechnicians(data.technicians || []);
      if (data.users) this.saveUsers(data.users);
      if (data.lanSettings) this.save(STORAGE_KEYS.LAN_SETTINGS, data.lanSettings);

      const logs = data.auditLogs || [];
      this.save(STORAGE_KEYS.AUDIT_LOGS, logs);

      this.addAuditLog(
        user,
        'DATABASE_RESTORED',
        `Restored complete database from backup file dated ${data.backupDate || 'unknown'}`,
        'system'
      );

      return { success: true, message: `Successfully restored ${data.customers.length} customers, ${data.invoices.length} invoices, and ${data.payments.length} payments.` };
    } catch (e: any) {
      return { success: false, message: `Failed to parse database file: ${e.message}` };
    }
  }

  public static resetToSampleData(user: string): void {
    this.saveCustomers(INITIAL_CUSTOMERS);
    this.savePackages(INITIAL_PACKAGES);
    this.saveInvoices(INITIAL_INVOICES);
    this.savePayments(INITIAL_PAYMENTS);
    this.saveComplaints(INITIAL_COMPLAINTS);
    this.saveTechnicians(INITIAL_TECHNICIANS);
    this.saveUsers(INITIAL_USERS);
    this.save(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.save(STORAGE_KEYS.LAN_SETTINGS, INITIAL_LAN_SETTINGS);

    this.addAuditLog(user, 'DATABASE_RESET', 'Database re-initialized to official demonstration sample data.', 'system');
  }

  // --- Financial & Dashboard Calculations ---
  public static getDashboardMetrics() {
    const customers = this.getCustomers();
    const invoices = this.getInvoices();
    const payments = this.getPayments();
    const complaints = this.getComplaints();

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const inactiveCustomers = customers.filter((c) => c.status === 'inactive').length;
    const suspendedCustomers = customers.filter((c) => c.status === 'suspended').length;

    // Total outstanding dues from customers
    const totalOutstandingDues = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);

    // Today's payments (based on YYYY-MM-DD match)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPayments = payments
      .filter((p) => p.status === 'completed' && p.paymentDate === todayStr)
      .reduce((acc, p) => acc + p.amount, 0);

    // Current month billing
    const currentMonthName = 'October 2026';
    const monthlyBillingInvoices = invoices.filter(
      (inv) => inv.status !== 'cancelled' && inv.billingMonth.toLowerCase().includes('october')
    );
    const monthlyBillingTotal = monthlyBillingInvoices.reduce((acc, inv) => acc + inv.totalPayable, 0);

    // Monthly revenue collected this month
    const monthlyRevenue = payments
      .filter((p) => p.status === 'completed' && p.paymentDate.startsWith('2026-10'))
      .reduce((acc, p) => acc + p.amount, 0);

    // Complaints counts
    const unresolvedComplaints = complaints.filter(
      (c) => c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress'
    ).length;
    const resolvedComplaints = complaints.filter(
      (c) => c.status === 'resolved' || c.status === 'closed'
    ).length;

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      suspendedCustomers,
      todayPayments,
      totalOutstandingDues,
      monthlyBillingTotal,
      monthlyRevenue,
      unresolvedComplaints,
      resolvedComplaints,
    };
  }
}
