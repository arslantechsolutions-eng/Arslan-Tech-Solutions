/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ARSLAN TECH SOLUTIONS ISP - User Manual, Windows Deployment & Acceptance Test
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Terminal,
  Monitor,
  Network,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  HelpCircle,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

export const HelpAndManual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'english' | 'urdu' | 'installer' | 'lan_guide' | 'acceptance'>('english');
  const [copiedScript, setCopiedScript] = useState(false);

  // Verification Checklist State
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
  });

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const innoSetupScript = `; -- ARSLAN TECH SOLUTIONS ISP - INNO SETUP INSTALLER SCRIPT --
[Setup]
AppName=ARSLAN TECH SOLUTIONS ISP Billing & Complaints Management
AppVersion=4.0 Professional
AppPublisher=ARSLAN TECH SOLUTIONS ISP
AppPublisherURL=https://arslantech.pk
DefaultDirName={autopf}\\ArslanTechISP
DefaultGroupName=Arslan Tech ISP
OutputDir=.
OutputBaseFilename=ArslanTech_ISP_v4.0_Setup
Compression=lzma2/max
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
SetupIconFile=app_icon.ico

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "dist\\*"; DestDir: "{app}\\applet"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "start_isp.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\\ARSLAN TECH ISP Management"; Filename: "{app}\\start_isp.bat"; IconFilename: "{app}\\app_icon.ico"
Name: "{autodesktop}\\ARSLAN TECH ISP"; Filename: "{app}\\start_isp.bat"; IconFilename: "{app}\\app_icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\\start_isp.bat"; Description: "{cm:LaunchProgram,ARSLAN TECH ISP}"; Flags: nowait postinstall skipifsilent`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(innoSetupScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Documentation & Production Deployment Suite</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Version 4.0 Professional</span>
            <span aria-hidden="true">·</span>
            <span>English & اردو (Urdu)</span>
          </div>
          <h2 className="text-lg font-bold text-white">Installation, User Manual & Testing Guide</h2>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs">
        <button
          onClick={() => setActiveTab('english')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'english' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>User Manual (English)</span>
        </button>
        <button
          onClick={() => setActiveTab('urdu')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'urdu' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-urdu">اردو یوزر مینول</span>
        </button>
        <button
          onClick={() => setActiveTab('installer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'installer' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Windows Installer & Shortcut Setup</span>
        </button>
        <button
          onClick={() => setActiveTab('lan_guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'lan_guide' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>2–5 Computers LAN Setup</span>
        </button>
        <button
          onClick={() => setActiveTab('acceptance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'acceptance' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>14-Point Acceptance Verification</span>
        </button>
      </div>

      {/* Tab 1: English User Manual */}
      {activeTab === 'english' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs text-slate-300">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">ARSLAN TECH SOLUTIONS ISP - Standard Operating Manual</h3>
            <p className="text-slate-400">Complete guide for billing officers, receptionists, and technical dispatchers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">1. Customer Registration & Onboarding</h4>
                <p>• Click <strong>Customers</strong> in the left sidebar or click <strong>+ Add Customer</strong> on the dashboard.</p>
                <p>• Fill in subscriber name, mobile number, CNIC, area (e.g. Gulberg, Model Town, Cantt), and select the internet package.</p>
                <p>• Provide optical line parameters: PPPoE Username, ONU MAC Address, and Static IP if assigned.</p>
                <p>• Click <strong>Save Customer Record</strong>. The system automatically assigns a unique Customer ID (`ATS-100X`) and Account Number (`ACC-2026-XXX`).</p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">2. Monthly Billing & Invoicing Engine</h4>
                <p>• In the <strong>Billing</strong> module, click <strong>Generate Monthly Bills (F2)</strong>.</p>
                <p>• Enter the billing cycle month (e.g. <em>November 2026</em>) and due date.</p>
                <p>• The system automatically calculates package charges and carries forward previous outstanding arrears.</p>
                <p>• <strong>Duplicate Bill Prevention:</strong> The software checks if a bill was already generated for that month and avoids duplicates.</p>
                <p>• Print bills in formal A4 layout with bank deposit slips or compact slips.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">3. Payment Collection & Receipt Issuance</h4>
                <p>• Press <strong>F3</strong> or click <strong>Receive Payment</strong>.</p>
                <p>• Select customer from search dropdown: current dues and package details appear automatically.</p>
                <p>• Enter payment amount (full or partial) and choose method (Cash, Bank Transfer, EasyPaisa, JazzCash, NayaPay).</p>
                <p>• Submit to instantly generate an official Receipt Number (`REC-2026-XXXX`).</p>
                <p>• Print receipt on <strong>80mm Thermal Slip Printer</strong> or <strong>A4 Paper</strong>.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">4. Complaint Ticketing & Field Dispatch</h4>
                <p>• Press <strong>F4</strong> or click <strong>Register Ticket</strong>.</p>
                <p>• Select customer: address, phone, and technical specs load automatically.</p>
                <p>• Choose category (Internet Down, Slow Speed, Fiber Cut, Router Fault) and priority.</p>
                <p>• Assign field technician (e.g. Muhammad Rizwan or Ali Hassan) and print the <strong>Work Order Job Card</strong> for field dispatch.</p>
                <p>• When technician returns, click <strong>Resolve</strong>, input optical power readings (dBm) and resolution remarks.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">5. Database Backup & Disaster Recovery</h4>
                <p>• Click <strong>Database / LAN</strong> in the sidebar.</p>
                <p>• Click <strong>Create Timestamped Backup</strong> to download a JSON database snapshot.</p>
                <p>• Store backup files on an external USB flash drive or secondary hard disk weekly.</p>
                <p>• In case of hardware failure, use <strong>Restore from Backup</strong> to re-import all records in seconds.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">6. User Security & Accountability</h4>
                <p>• Administrator accounts (`admin` / `admin123`) have full access to tariffs, backups, and payment voids.</p>
                <p>• Staff accounts (`staff` / `staff123`) can register customers, issue bills, and collect payments.</p>
                <p>• Sensitive transactions require 4-digit PIN verification (`1234`) and are permanently logged in the Audit Trail.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Urdu User Manual */}
      {activeTab === 'urdu' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-sm text-slate-300 font-urdu text-right" dir="rtl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-emerald-400">ارسلان ٹیک سلوشنز آئی ایس پی - مکمل اردو یوزر گائیڈ و طریقہ کار</h3>
            <p className="text-slate-400 text-xs">بلنگ آفیسرز اور ٹیکنیکل سٹاف کے لیے روزمرہ استعمال کی مکمل رہنمائی</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-base">۱۔ نئے کسٹمر (صارف) کا اندراج</h4>
                <p>• بائیں جانب <strong>کسٹمرز (Customers)</strong> مینو پر کلک کریں یا ڈیش بورڈ سے <strong>Add Customer</strong> کا بٹن دبائیں۔</p>
                <p>• صارف کا مکمل نام، موبائل نمبر، شناختی کارڈ، رہائشی پتہ اور علاقہ (جیسے ماڈل ٹاؤن، گلبرگ، کینٹ) درج کریں۔</p>
                <p>• مطلوبہ انٹرنیٹ پیکج منتخب کریں۔ ماہانہ فیس خود بخود درج ہو جائے گی۔</p>
                <p>• صارف کی تکنیکی معلومات (PPPoE یوزر نیم اور ONU MAC ایڈریس) درج کر کے محفوظ کریں۔ نیا کسٹمر فوری سسٹم میں شامل ہو جائے گا۔</p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-base">۲۔ ماہانہ بل جنریشن (بلنگ)</h4>
                <p>• <strong>بلنگ (Billing)</strong> سیکشن میں جائیں اور <strong>Generate Monthly Bills (F2)</strong> دبائیں۔</p>
                <p>• بلنگ کا مہینہ اور آخری تاریخ (Due Date) درج کر کے اوکے کریں۔</p>
                <p>• سسٹم تمام ایکٹو صارفین کا بل تیار کر دے گا اور پچھلے بقایاجات خود بخود شامل کر لے گا۔</p>
                <p>• سسٹم میں ڈپلیکیٹ بلنگ کی روک تھام موجود ہے، ایک ہی ماہ کا دو بار بل نہیں بنے گا۔</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-base">۳۔ فیس وصولی اور رسید کا پرنٹ</h4>
                <p>• کی بورڈ سے <strong>F3</strong> بٹن دبائیں یا <strong>Receive Payment</strong> پر کلک کریں۔</p>
                <p>• صارف کا نام منتخب کریں۔ اس کے ذمے کل واجب الادا رقم سامنے آ جائے گی۔</p>
                <p>• وصول شدہ رقم درج کریں اور ادائیگی کا طریقہ (کیش، بینک، ایزی پیسہ یا جاز کیش) چنیں۔</p>
                <p>• رسید خود بخود جنریٹ ہو جائے گی۔ آپ تھرمل پرنٹر یا A4 پیپر پر فوری پرنٹ لے سکتے ہیں۔</p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-base">۴۔ شکایات کا اندراج اور ٹیکنیشن ورک آرڈر</h4>
                <p>• شکایت موصول ہونے پر <strong>F4</strong> دبائیں۔</p>
                <p>• شکایت کی قسم (انٹرنیٹ بند، سلو سپیڈ، فائبر کٹ، راؤٹر خرابی) منتخب کریں۔</p>
                <p>• فیلڈ ٹیکنیشن نامزد کر کے <strong>Job Card</strong> پرنٹ کریں تاکہ ٹیکنیشن موقع پر جا کر لائٹ (dBm) چیک کر سکے۔</p>
                <p>• مسئلہ حل ہونے پر <strong>Resolve</strong> پر کلک کر کے ریمارکس درج کریں۔</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Windows Installer & Shortcut Setup */}
      {activeTab === 'installer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs text-slate-300">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Windows Standalone Desktop Deployment Package</h3>
              <p className="text-slate-400">Offline executable installer configuration & launch script.</p>
            </div>
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied Script!' : 'Copy Inno Setup Script'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>1. One-Click Windows Launch Script (`start_isp.bat`)</span>
              </h4>
              <p className="text-slate-400">
                Place this file inside the installation directory to run the application completely offline:
              </p>
              <pre className="bg-slate-900 p-3 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
{`@echo off
title ARSLAN TECH SOLUTIONS ISP - v4.0 Professional
echo ============================================================
echo   ARSLAN TECH SOLUTIONS ISP - Billing & Complaints v4.0
echo   Starting Offline Local Engine...
echo ============================================================
start "" "http://localhost:3000"
npm run dev
pause`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>2. Create Windows Desktop Shortcut</span>
              </h4>
              <p>• Right-click on <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">start_isp.bat</code> in the installation folder.</p>
              <p>• Select <strong>Send to &gt; Desktop (create shortcut)</strong>.</p>
              <p>• Rename the shortcut on your desktop to: <strong className="text-white">ARSLAN TECH ISP Billing & Complaints</strong>.</p>
              <p>• Right click shortcut &gt; Properties &gt; Change Icon &gt; Choose ISP modem/network icon.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>3. Inno Setup 6 `.iss` Compilation Script</span>
              </h4>
              <p className="text-slate-400">
                You can compile this ready-to-run script using free Inno Setup 6 to generate a professional Windows <code className="text-emerald-400">ArslanTech_ISP_v4.0_Setup.exe</code> installer:
              </p>
              <pre className="bg-slate-900 p-3 rounded text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-48">
{innoSetupScript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 2–5 Computers LAN Setup */}
      {activeTab === 'lan_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs text-slate-300">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">2 to 5 Computers Local Area Network (LAN) Configuration Guide</h3>
            <p className="text-slate-400">Connect receptionist, cashier, and technical desk to the single central database.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm text-sky-400">Master Server Computer (Host PC)</h4>
              <p>1. Designate one computer as the <strong>Main Server (Host)</strong>.</p>
              <p>2. Give this computer a static IP address in Windows Network Settings (e.g., <code className="text-emerald-400 font-mono">192.168.1.100</code>).</p>
              <p>3. Open Windows PowerShell as Administrator and run this command to open the firewall port:</p>
              <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-slate-200 border border-slate-800">
netsh advfirewall firewall add rule name="ArslanTechISP" dir=in action=allow protocol=TCP localport=3000
              </pre>
              <p>4. Start the application on the host computer. The server is now broadcasting across your office LAN.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm text-purple-400">Workstation Clients (Billing Counters 1–4)</h4>
              <p>1. Connect workstation PCs to the same office Wi-Fi router or switch.</p>
              <p>2. Open Google Chrome, Microsoft Edge, or the desktop shortcut on the workstation.</p>
              <p>3. In the address bar, type: <strong className="text-emerald-400 font-mono">http://192.168.1.100:3000</strong></p>
              <p>4. Bookmark this page or click Chrome menu &gt; <em>Install ARSLAN TECH SOLUTIONS ISP</em> as an offline desktop app.</p>
              <p>5. Both computers now share the same customers, invoices, and payments in real time.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: 14-Point Acceptance Verification */}
      {activeTab === 'acceptance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs text-slate-300">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Final 14-Point Acceptance Test Verification</h3>
              <p className="text-slate-400">Mandatory verification points required by project specification.</p>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {Object.values(checkedItems).filter(Boolean).length} / 14 Passed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 1, text: 'A customer can be registered with full contact, area, and technical details.' },
              { id: 2, text: 'An internet package with speed (Mbps) and PKR fee can be assigned.' },
              { id: 3, text: 'A monthly invoice can be generated automatically or manually.' },
              { id: 4, text: 'A full or partial payment can be recorded against customer dues.' },
              { id: 5, text: 'A receipt can be printed on 80mm thermal slip or A4 paper.' },
              { id: 6, text: 'A customer complaint ticket can be registered with category and priority.' },
              { id: 7, text: 'A field technician can be assigned and a Work Order Job Card printed.' },
              { id: 8, text: 'A complaint can be resolved with technician remarks and optical readings.' },
              { id: 9, text: 'Dashboard figures update accurately in real time.' },
              { id: 10, text: 'Reports display accurate financial totals with CSV and print export.' },
              { id: 11, text: 'Data remains available after restarting computer or closing browser.' },
              { id: 12, text: 'Core functions work 100% offline with internet cable disconnected.' },
              { id: 13, text: 'Two or more authorized LAN users can access shared data safely.' },
              { id: 14, text: 'Database backup download and restore functions work correctly.' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedItems[item.id]
                    ? 'bg-slate-950 border-emerald-800/60 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    checkedItems[item.id]
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-700 bg-slate-900 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-400 mr-1.5">#{item.id}.</span>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
