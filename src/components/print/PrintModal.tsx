/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - Printable Document Viewer & Print Engine
 */

import React, { useState } from 'react';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Customer, Invoice, Payment, Complaint, PrintDocumentConfig } from '../../types';

interface PrintModalProps {
  config: PrintDocumentConfig | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ config, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>(config?.format || 'a4');

  if (!config) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      {/* On screen modal */}
      <div className="no-print bg-slate-900 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">Document Print Preview</h2>
              <p className="text-xs text-slate-400">ARSLAN TECH SOLUTIONS ISP - Document Generation Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {config.type === 'receipt' && (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md text-xs">
                <button
                  type="button"
                  onClick={() => setPrintFormat('a4')}
                  className={`px-3 py-1 rounded transition-colors ${
                    printFormat === 'a4' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A4 Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('thermal')}
                  className={`px-3 py-1 rounded transition-colors ${
                    printFormat === 'thermal' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  80mm Thermal Slip
                </button>
              </div>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Document Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          <div
            className={`bg-white text-slate-900 shadow-xl transition-all ${
              printFormat === 'thermal'
                ? 'w-[340px] p-4 text-xs font-mono'
                : 'w-[794px] min-h-[1123px] p-10 font-sans'
            }`}
          >
            {renderDocumentContent(config, printFormat)}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
          <span>Tip: In Windows print dialog, choose "Save as PDF" to export digital invoice or voucher.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* Actual Print Container (rendered only during browser print) */}
      <div className="print-only">
        <div
          className={`${
            printFormat === 'thermal'
              ? 'w-[80mm] max-w-[80mm] p-2 text-[11px] font-mono mx-auto'
              : 'w-full max-w-[210mm] p-6 text-sm font-sans mx-auto'
          }`}
        >
          {renderDocumentContent(config, printFormat)}
        </div>
      </div>
    </div>
  );
};

function renderDocumentContent(config: PrintDocumentConfig, format: 'a4' | 'thermal') {
  switch (config.type) {
    case 'invoice':
      return renderInvoice(config.data as Invoice);
    case 'receipt':
      return format === 'thermal'
        ? renderThermalReceipt(config.data as Payment)
        : renderA4Receipt(config.data as Payment);
    case 'complaint':
      return renderComplaintWorkOrder(config.data as Complaint);
    case 'customer_profile':
      return renderCustomerProfile(config.data as Customer);
    default:
      return <div>No preview available</div>;
  }
}

// 1. INVOICE (A4)
function renderInvoice(invoice: Invoice) {
  return (
    <div className="text-slate-900 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 text-white font-bold flex items-center justify-center text-xl rounded">
              ATS
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">ARSLAN TECH SOLUTIONS ISP</h1>
              <p className="text-xs text-slate-600 font-medium">Licensed Optical Fiber Internet & Data Network Provider</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 mt-2 space-y-0.5">
            <p>Main Commercial Plaza, Lahore, Pakistan</p>
            <p>UAN / Helpline: 0300-1234567 | Support: support@arslantech.pk</p>
            <p>NTN: 8291044-2 | Sales Tax Registered</p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block bg-slate-900 text-white px-3 py-1 font-bold tracking-wider text-sm rounded-xs mb-2">
            CUSTOMER BILL / INVOICE
          </div>
          <p className="text-sm font-bold text-slate-800">Invoice #: {invoice.invoiceNumber}</p>
          <p className="text-xs text-slate-600">Issue Date: {invoice.issueDate}</p>
          <p className="text-xs font-semibold text-rose-700">Due Date: {invoice.dueDate}</p>
          <p className="text-xs text-slate-600">Billing Month: {invoice.billingMonth}</p>
        </div>
      </div>

      {/* Customer & Billing Info */}
      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 border border-slate-200 rounded">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Billed To</span>
          <p className="text-base font-bold text-slate-900">{invoice.customerName}</p>
          <p className="text-xs text-slate-700 font-mono">Account ID: {invoice.customerAccountNo}</p>
          <p className="text-xs text-slate-700">Customer ID: {invoice.customerId}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Status</span>
          <span
            className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded ${
              invoice.status === 'paid'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : invoice.status === 'partial'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {invoice.status}
          </span>
          <p className="text-xs text-slate-600 mt-1">Generated by: {invoice.generatedBy}</p>
        </div>
      </div>

      {/* Itemized Table */}
      <table className="w-full text-left border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-800 text-white text-xs font-semibold">
            <th className="py-2.5 px-3 border border-slate-700">#</th>
            <th className="py-2.5 px-3 border border-slate-700">Description</th>
            <th className="py-2.5 px-3 text-right border border-slate-700">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody className="text-xs divide-y divide-slate-200">
          <tr>
            <td className="py-2 px-3 border border-slate-200 font-mono">01</td>
            <td className="py-2 px-3 border border-slate-200 font-medium">
              Monthly Optical Fiber Internet Package Fee ({invoice.billingMonth})
            </td>
            <td className="py-2 px-3 text-right font-mono tabular-nums border border-slate-200">
              PKR {invoice.packageCharges.toLocaleString()}
            </td>
          </tr>
          {invoice.installationCharges > 0 && (
            <tr>
              <td className="py-2 px-3 border border-slate-200 font-mono">02</td>
              <td className="py-2 px-3 border border-slate-200">Fiber Installation & Drop Cable Charges</td>
              <td className="py-2 px-3 text-right font-mono tabular-nums border border-slate-200">
                PKR {invoice.installationCharges.toLocaleString()}
              </td>
            </tr>
          )}
          {invoice.otherCharges > 0 && (
            <tr>
              <td className="py-2 px-3 border border-slate-200 font-mono">03</td>
              <td className="py-2 px-3 border border-slate-200">{invoice.otherChargesDesc || 'Additional Equipment / Services'}</td>
              <td className="py-2 px-3 text-right font-mono tabular-nums border border-slate-200">
                PKR {invoice.otherCharges.toLocaleString()}
              </td>
            </tr>
          )}
          {invoice.previousDues > 0 && (
            <tr className="bg-rose-50/50">
              <td className="py-2 px-3 border border-slate-200 font-mono">04</td>
              <td className="py-2 px-3 border border-slate-200 text-rose-800 font-medium">
                Previous Arrears / Outstanding Balance
              </td>
              <td className="py-2 px-3 text-right font-mono tabular-nums text-rose-800 border border-slate-200">
                PKR {invoice.previousDues.toLocaleString()}
              </td>
            </tr>
          )}
          {invoice.discount > 0 && (
            <tr className="bg-emerald-50/50">
              <td className="py-2 px-3 border border-slate-200 font-mono">05</td>
              <td className="py-2 px-3 border border-slate-200 text-emerald-800 font-medium">Special Discount / Adjustment</td>
              <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-800 border border-slate-200">
                - PKR {invoice.discount.toLocaleString()}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Calculations & Total */}
      <div className="flex justify-between items-start pt-2">
        <div className="text-xs text-slate-600 max-w-sm space-y-2 border border-slate-200 p-3 rounded bg-slate-50">
          <p className="font-semibold text-slate-800">Important Instructions:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Please pay on or before the due date to avoid service disconnection.</li>
            <li>Late payment surcharge of PKR {invoice.lateFee} applies after due date.</li>
            <li>Direct Bank Transfer: Meezan Bank A/C: 0214-0105892110 (Arslan Tech).</li>
            <li>EasyPaisa / JazzCash Till: 994201 (Enter customer Account # in memo).</li>
          </ul>
        </div>

        <div className="w-64 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
            <span>Subtotal:</span>
            <span className="font-mono tabular-nums">PKR {invoice.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold text-sm py-1 border-b-2 border-slate-800">
            <span>Total Payable by Due Date:</span>
            <span className="font-mono tabular-nums">PKR {invoice.totalPayable.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
            <span>Amount Paid:</span>
            <span className="font-mono tabular-nums text-emerald-700">PKR {invoice.amountPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold py-1 bg-slate-100 px-2 rounded">
            <span>Balance Due:</span>
            <span className="font-mono tabular-nums text-rose-700">PKR {invoice.remainingBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-rose-700 text-[11px] pt-1">
            <span>Payable After Due Date:</span>
            <span className="font-mono tabular-nums font-semibold">
              PKR {(invoice.totalPayable + invoice.lateFee).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures & Barcode */}
      <div className="pt-8 flex justify-between items-end border-t border-slate-300">
        <div>
          <div className="font-mono text-xs tracking-widest bg-slate-100 px-3 py-1 border border-dashed border-slate-400">
            *||| {invoice.invoiceNumber} |||*
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Computer Generated Invoice - No signature required.</p>
        </div>
        <div className="text-center w-48">
          <div className="border-b border-slate-400 pb-8"></div>
          <p className="text-xs font-semibold text-slate-700 mt-1">Authorized Billing Officer</p>
          <p className="text-[10px] text-slate-500">ARSLAN TECH SOLUTIONS ISP</p>
        </div>
      </div>
    </div>
  );
}

// 2. RECEIPT (A4 FORMAL)
function renderA4Receipt(payment: Payment) {
  return (
    <div className="text-slate-900 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-emerald-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-700 text-white font-bold flex items-center justify-center text-xl rounded">
              ATS
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">ARSLAN TECH SOLUTIONS ISP</h1>
              <p className="text-xs text-slate-600 font-medium">Official Cash & Digital Payment Voucher</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2">Main Commercial Plaza, Lahore | Helpline: 0300-1234567</p>
        </div>

        <div className="text-right">
          <div className="inline-block bg-emerald-700 text-white px-3 py-1 font-bold tracking-wider text-sm rounded-xs mb-2">
            OFFICIAL PAYMENT RECEIPT
          </div>
          <p className="text-sm font-bold text-slate-800">Receipt #: {payment.receiptNumber}</p>
          <p className="text-xs text-slate-600">Payment Date: {payment.paymentDate}</p>
        </div>
      </div>

      {/* Receipt Body */}
      <div className="bg-slate-50 p-5 border border-slate-200 rounded space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Received With Thanks From:</span>
            <span className="text-base font-bold text-slate-900 block">{payment.customerName}</span>
            <span className="text-slate-600 font-mono">Customer ID: {payment.customerId}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Payment Mode:</span>
            <span className="font-bold uppercase text-slate-900 block">{payment.paymentMethod.replace('_', ' ')}</span>
            {payment.referenceNo && (
              <span className="text-slate-600 font-mono block">Ref/Trx ID: {payment.referenceNo}</span>
            )}
          </div>
        </div>

        <div className="border-t border-b border-slate-300 py-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Amount Received (in PKR):</span>
          <span className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
            PKR {payment.amount.toLocaleString()}
          </span>
        </div>

        {payment.notes && (
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Remarks / Purpose:</span> {payment.notes}
          </div>
        )}
      </div>

      {/* Footer & Stamps */}
      <div className="pt-8 flex justify-between items-end">
        <div>
          <div className="w-24 h-24 border-2 border-emerald-600/40 rounded-full flex flex-col items-center justify-center text-[10px] text-emerald-700 uppercase font-bold transform -rotate-12">
            <span>ATS ISP</span>
            <span>PAID & VERIFIED</span>
            <span>OFFICIAL</span>
          </div>
        </div>
        <div className="text-center w-48">
          <div className="border-b border-slate-400 pb-6">
            <p className="text-xs text-slate-600 italic">{payment.collectorName}</p>
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-1">Cashier / Receiving Officer</p>
          <p className="text-[10px] text-slate-500">ARSLAN TECH SOLUTIONS ISP</p>
        </div>
      </div>
    </div>
  );
}

// 3. RECEIPT (80mm THERMAL POS SLIP)
function renderThermalReceipt(payment: Payment) {
  return (
    <div className="text-center space-y-2 leading-tight">
      <div className="border-b border-dashed border-slate-400 pb-2">
        <h2 className="font-bold text-sm">ARSLAN TECH SOLUTIONS</h2>
        <p className="text-[10px]">ISP BILLING & SERVICES</p>
        <p className="text-[9px]">Helpline: 0300-1234567</p>
      </div>

      <div className="text-left text-[11px] py-1 border-b border-dashed border-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span className="font-bold">{payment.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{payment.paymentDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-bold truncate max-w-[170px]">{payment.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer ID:</span>
          <span>{payment.customerId}</span>
        </div>
        <div className="flex justify-between">
          <span>Method:</span>
          <span className="uppercase">{payment.paymentMethod}</span>
        </div>
        {payment.referenceNo && (
          <div className="flex justify-between">
            <span>Ref No:</span>
            <span>{payment.referenceNo}</span>
          </div>
        )}
      </div>

      <div className="py-2 border-b border-dashed border-slate-400">
        <p className="text-[11px] font-semibold">AMOUNT RECEIVED</p>
        <p className="text-xl font-bold font-mono">PKR {payment.amount.toLocaleString()}</p>
      </div>

      <div className="text-[9px] text-slate-600 space-y-0.5 pt-1">
        <p>Collector: {payment.collectorName}</p>
        <p>Thank you for choosing Arslan Tech ISP!</p>
        <p>For complaints call: 0300-1234567</p>
        <p className="pt-2 font-mono text-[8px]">*||| {payment.receiptNumber} |||*</p>
      </div>
    </div>
  );
}

// 4. COMPLAINT WORK ORDER / JOB CARD
function renderComplaintWorkOrder(complaint: Complaint) {
  return (
    <div className="text-slate-900 space-y-5">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ARSLAN TECH SOLUTIONS ISP</h1>
          <p className="text-xs text-slate-600">Field Technical Work Order & Complaint Ticket</p>
        </div>
        <div className="text-right">
          <div className="inline-block bg-slate-900 text-white px-3 py-1 font-bold text-xs uppercase mb-1">
            WORK ORDER
          </div>
          <p className="text-sm font-bold">Ticket: {complaint.ticketNumber}</p>
          <p className="text-xs text-slate-600">Registered: {new Date(complaint.registeredAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 bg-slate-50 text-xs">
        <div>
          <span className="text-slate-500 font-bold block mb-1">Customer Information:</span>
          <p className="font-bold text-sm text-slate-900">{complaint.customerName}</p>
          <p className="text-slate-700">Phone: {complaint.customerPhone}</p>
          <p className="text-slate-700">Address: {complaint.customerAddress}</p>
          <p className="text-slate-700">Area: {complaint.customerArea}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold block mb-1">Ticket Details:</span>
          <p className="text-slate-800"><span className="font-semibold">Category:</span> {complaint.category.replace('_', ' ').toUpperCase()}</p>
          <p className="text-slate-800"><span className="font-semibold">Priority:</span> {complaint.priority.toUpperCase()}</p>
          <p className="text-slate-800"><span className="font-semibold">Assigned Technician:</span> {complaint.assignedTechnicianName || 'Unassigned'}</p>
          <p className="text-slate-800"><span className="font-semibold">Current Status:</span> {complaint.status.toUpperCase()}</p>
        </div>
      </div>

      <div className="border border-slate-300 p-4 text-xs space-y-2">
        <span className="font-bold text-slate-800">Reported Problem Description:</span>
        <p className="bg-white p-3 border border-slate-200 rounded text-slate-800 font-mono text-[11px]">
          {complaint.description}
        </p>
      </div>

      {/* Technician On-site Inspection Form (Blank for manual technician fill) */}
      <div className="border border-slate-300 p-4 text-xs space-y-4">
        <span className="font-bold text-slate-800">On-Site Technician Inspection Report (Fill on Field):</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="border-b border-slate-400 pb-1">Optical Power (dBm): ____________</div>
          <div className="border-b border-slate-400 pb-1">Patch Cord Replaced: [ ] Yes [ ] No</div>
          <div className="border-b border-slate-400 pb-1">Fiber Spliced at Joint: ___________</div>
        </div>
        <div className="space-y-1">
          <span>Resolution Remarks:</span>
          <div className="border border-slate-200 h-16 bg-white p-2 text-slate-700">
            {complaint.resolutionNotes || ''}
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-end border-t border-slate-300 text-xs">
        <div>
          <div className="border-b border-slate-400 w-44 pb-6"></div>
          <p className="mt-1 font-semibold text-slate-700">Customer Signature & Satisfaction</p>
        </div>
        <div className="text-right">
          <div className="border-b border-slate-400 w-44 pb-6"></div>
          <p className="mt-1 font-semibold text-slate-700">Technician Signature & Stamp</p>
        </div>
      </div>
    </div>
  );
}

// 5. CUSTOMER PROFILE DOSSIER
function renderCustomerProfile(customer: Customer) {
  return (
    <div className="text-slate-900 space-y-6">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ARSLAN TECH SOLUTIONS ISP</h1>
          <p className="text-xs text-slate-600">Subscriber Connection Profile & Service Dossier</p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase mb-1">
            CLIENT RECORD
          </span>
          <p className="text-sm font-bold font-mono">{customer.id}</p>
          <p className="text-xs text-slate-600">Account: {customer.accountNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 text-xs">
        <div className="border border-slate-200 p-4 rounded bg-slate-50 space-y-2">
          <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wide">
            Personal & Location Details
          </h3>
          <p><span className="text-slate-500">Full Name:</span> <strong className="text-slate-900">{customer.name}</strong></p>
          <p><span className="text-slate-500">Contact Number:</span> <strong className="font-mono">{customer.phone}</strong></p>
          <p><span className="text-slate-500">CNIC / National ID:</span> <strong className="font-mono">{customer.cnic}</strong></p>
          <p><span className="text-slate-500">Email:</span> {customer.email || 'N/A'}</p>
          <p><span className="text-slate-500">Address:</span> {customer.address}</p>
          <p><span className="text-slate-500">Area / Distribution Zone:</span> <strong>{customer.area}</strong></p>
        </div>

        <div className="border border-slate-200 p-4 rounded bg-slate-50 space-y-2">
          <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wide">
            Network & Equipment Specifications
          </h3>
          <p><span className="text-slate-500">Service Architecture:</span> <strong>{customer.serviceType}</strong></p>
          <p><span className="text-slate-500">PPPoE / Radius Username:</span> <strong className="font-mono">{customer.pppoeUsername}</strong></p>
          <p><span className="text-slate-500">ONU / ONT MAC Address:</span> <strong className="font-mono">{customer.onuMac}</strong></p>
          <p><span className="text-slate-500">Static / Dynamic IP:</span> <span className="font-mono">{customer.ipAddress || 'Dynamic Pool'}</span></p>
          <p><span className="text-slate-500">Installed Customer Router:</span> {customer.routerModel || 'Standard Gigabit ONU'}</p>
          <p><span className="text-slate-500">Installation Date:</span> {customer.installationDate}</p>
        </div>
      </div>

      <div className="border border-slate-200 p-4 rounded bg-slate-50 text-xs">
        <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wide mb-2">
          Billing & Account Standing
        </h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-white p-2 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 block">Current Status</span>
            <span className="font-bold uppercase text-xs text-slate-800">{customer.status}</span>
          </div>
          <div className="bg-white p-2 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 block">Billing Cycle Day</span>
            <span className="font-bold text-xs">{customer.billingCycleDay} of every month</span>
          </div>
          <div className="bg-white p-2 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 block">Monthly Rate</span>
            <span className="font-bold font-mono text-xs">PKR {customer.monthlyFee.toLocaleString()}</span>
          </div>
          <div className="bg-white p-2 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 block">Outstanding Ledger Dues</span>
            <span className={`font-bold font-mono text-xs ${customer.balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              PKR {customer.balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[11px] text-slate-500">
        <p>ARSLAN TECH SOLUTIONS ISP · Confidential Customer Record</p>
        <p>Printed on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
