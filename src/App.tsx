/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Billing & Complaints Management System v4.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storageService';
import { ActiveTab, User, PrintDocumentConfig, Customer, Invoice, Payment, Complaint } from './types';
import { DesktopWindow } from './components/layout/DesktopWindow';
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerManager } from './components/customers/CustomerManager';
import { BillingManager } from './components/billing/BillingManager';
import { PaymentManager } from './components/payments/PaymentManager';
import { ComplaintManager } from './components/complaints/ComplaintManager';
import { TechnicianManager } from './components/technicians/TechnicianManager';
import { PackageManager } from './components/packages/PackageManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { DatabaseLanManager } from './components/database/DatabaseLanManager';
import { AuditLogView } from './components/system/AuditLogView';
import { HelpAndManual } from './components/help/HelpAndManual';
import { PrintModal } from './components/print/PrintModal';
import { LoginModal } from './components/auth/LoginModal';
import { ChangePinModal } from './components/auth/ChangePinModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [printConfig, setPrintConfig] = useState<PrintDocumentConfig | null>(null);

  // Preselected customer for cross-module workflows (e.g. collect payment from customer profile)
  const [paymentTargetCustomer, setPaymentTargetCustomer] = useState<Customer | null>(null);
  // Force rerender key when database is restored or reset
  const [dataVersion, setDataVersion] = useState(0);

  // Inactivity auto-lock (15 minutes of inactivity)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsSessionExpired(true);
        setIsLoginModalOpen(true);
      }, 15 * 60 * 1000); // 15 mins
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  const handlePrintDocument = (
    type: 'invoice' | 'receipt' | 'complaint' | 'customer_profile' | 'report',
    data: any,
    format?: 'a4' | 'thermal'
  ) => {
    setPrintConfig({
      type,
      data,
      format: format || (type === 'receipt' ? 'a4' : 'a4'),
    });
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new_customer') {
      setActiveTab('customers');
    } else if (action === 'generate_bill') {
      setActiveTab('billing');
    } else if (action === 'collect_payment') {
      setPaymentTargetCustomer(null);
      setActiveTab('payments');
    } else if (action === 'new_complaint') {
      setActiveTab('complaints');
    }
  };

  const handleReceivePaymentForCustomer = (customer: Customer) => {
    setPaymentTargetCustomer(customer);
    setActiveTab('payments');
  };

  const handleReceivePaymentForInvoice = (invoice: Invoice) => {
    const cust = StorageService.getCustomerById(invoice.customerId);
    if (cust) {
      setPaymentTargetCustomer(cust);
    }
    setActiveTab('payments');
  };

  const handleDatabaseChanged = () => {
    setDataVersion((v) => v + 1);
  };

  return (
    <DesktopWindow
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentUser={currentUser}
      onLogout={() => {
        setIsSessionExpired(false);
        setIsLoginModalOpen(true);
      }}
      onChangePin={() => setIsChangePinModalOpen(true)}
      onQuickAction={handleQuickAction}
    >
      {/* Dynamic Module Content View */}
      <div key={dataVersion}>
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onQuickAction={handleQuickAction}
            onPrintDocument={handlePrintDocument}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            onPrintCustomerProfile={(c) => handlePrintDocument('customer_profile', c)}
            onReceivePaymentForCustomer={handleReceivePaymentForCustomer}
            currentUserRole={currentUser.role}
          />
        )}

        {activeTab === 'billing' && (
          <BillingManager
            onPrintInvoice={(inv) => handlePrintDocument('invoice', inv)}
            onReceivePaymentForInvoice={handleReceivePaymentForInvoice}
            currentUser={currentUser.username}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentManager
            onPrintReceipt={(pay) => handlePrintDocument('receipt', pay)}
            currentUser={currentUser.username}
            currentUserRole={currentUser.role}
            preselectedCustomer={paymentTargetCustomer}
          />
        )}

        {activeTab === 'complaints' && (
          <ComplaintManager
            onPrintWorkOrder={(c) => handlePrintDocument('complaint', c)}
            currentUser={currentUser.username}
          />
        )}

        {activeTab === 'technicians' && (
          <TechnicianManager
            onPrintWorkOrder={(c) => handlePrintDocument('complaint', c)}
            currentUser={currentUser.username}
          />
        )}

        {activeTab === 'packages' && <PackageManager currentUser={currentUser.username} />}

        {activeTab === 'reports' && <ReportsManager />}

        {activeTab === 'database_lan' && (
          <DatabaseLanManager
            currentUser={currentUser.username}
            currentUserRole={currentUser.role}
            onDataChanged={handleDatabaseChanged}
          />
        )}

        {activeTab === 'audit_log' && <AuditLogView />}

        {activeTab === 'manual_install' && <HelpAndManual />}
      </div>

      {/* Global Printable Document Viewer Modal */}
      {printConfig && (
        <PrintModal config={printConfig} onClose={() => setPrintConfig(null)} />
      )}

      {/* User Login & Authentication Screen */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
          setIsSessionExpired(false);
        }}
        isSessionExpired={isSessionExpired}
      />

      {/* Change Security PIN Modal */}
      {isChangePinModalOpen && (
        <ChangePinModal user={currentUser} onClose={() => setIsChangePinModalOpen(false)} />
      )}
    </DesktopWindow>
  );
}
