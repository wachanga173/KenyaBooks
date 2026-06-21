'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [os, setOs] = useState('win');

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('mac') !== -1) setOs('mac');
    else if (ua.indexOf('linux') !== -1) setOs('linux');
    else setOs('win');
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      {/* Nav */}
      <nav className="border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            KenyaBooks
          </span>
          <Link
            href={`/api/download?os=${os}`}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full text-sm transition-all hover:scale-105"
          >
            Download Free
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          KenyaBooks v1.0 is now live
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent max-w-4xl leading-tight">
          The ultimate offline accounting software for Kenya
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Manage your business with built-in KRA eTIMS integration, automatic
          PAYE calculations, M-Pesa support, and a fully featured offline
          spreadsheet. No subscription, no cloud — everything stays on your
          machine.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href={`/api/download?os=${os}`}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 text-lg"
          >
            ⬇ Download for {os === 'mac' ? 'Mac (.dmg)' : os === 'linux' ? 'Linux (.AppImage)' : 'Windows (.exe)'}
          </Link>
          <a
            href="#features"
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-medium rounded-full transition-all"
          >
            View Features
          </a>
        </div>

        {/* Feature Grid */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-6xl mt-12"
        >
          {[
            {
              title: '📊 Inbuilt Spreadsheet',
              desc: 'Full Excel-like spreadsheet with formulas, multiple sheets, freeze rows, and accounting templates (P&L, Balance Sheet, Trial Balance).',
            },
            {
              title: '🇰🇪 Kenya-Ready',
              desc: 'KRA PIN fields, 16% VAT auto-calc, PAYE 2024/25 bands, NHIF/SHIF & NSSF deductions, M-Pesa payments, all 47 counties.',
            },
            {
              title: '🔗 KRA Portals Inside',
              desc: 'Access iTax, eTIMS, NHIF, NSSF, and CBK exchange rates directly through built-in browser tabs — no need to leave the app.',
            },
            {
              title: '💾 Offline & Private',
              desc: 'Your data stays on your machine in a local SQLite database. One-click backup and restore. No cloud, no subscription.',
            },
            {
              title: '🧾 Full Accounting Suite',
              desc: 'Chart of Accounts, Journal Entries, Invoicing, Bills, Payments, Expenses, Payroll, Bank Reconciliation, Inventory & Assets.',
            },
            {
              title: '📤 Export Everything',
              desc: 'Generate professional PDFs (invoices, payslips), export to Excel (.xlsx), Word (.docx), and CSV for bulk imports.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors duration-300"
            >
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p className="mb-4">
            © {new Date().getFullYear()} KenyaBooks. Built for Kenyan
            businesses. Free & open source.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
