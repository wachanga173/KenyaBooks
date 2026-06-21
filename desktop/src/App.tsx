import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileSpreadsheet, BookOpen, Receipt, Wallet, Building2,
  Globe, Settings, Calculator, Plus, Pencil, Trash2, TrendingUp,
  ArrowDownRight, FileText, DollarSign, CreditCard, Package, Landmark,
  ClipboardList, Users, BarChart3, Search, ChevronRight, ArrowUpRight,
  Banknote
} from 'lucide-react';
import SpreadsheetView from './components/SpreadsheetView';
import { Modal, useConfirm, Input, Select, Textarea, StatusBadge, EmptyState } from './components/ui';
import { KENYA_COUNTIES, PAYMENT_METHODS, ACCOUNT_TYPES, KRA_PORTALS, formatKES, today, calculatePAYE, calculateNHIF, calculateNSSF } from './lib/constants';

const api = () => (window as any).api;

// ═══════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════
function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState<any>({ revenue: 0, expenses: 0, outstanding: 0, profit: 0 });
  useEffect(() => { api()?.dashboard.stats().then(setStats); }, []);

  const cards = [
    { label: 'Revenue', value: formatKES(stats.revenue), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Expenses', value: formatKES(stats.expenses), icon: ArrowDownRight, color: 'text-red-400' },
    { label: 'Outstanding', value: formatKES(stats.outstanding), icon: FileText, color: 'text-yellow-400' },
    { label: 'Net Profit', value: formatKES(stats.profit), icon: DollarSign, color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="p-4 rounded-xl border border-[#27272a] bg-[#0a0a0c] hover:bg-[#18181b] transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{c.label}</span>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-100">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'New Invoice', tab: 'invoicing', icon: Receipt },
              { label: 'Record Expense', tab: 'expenses', icon: Wallet },
              { label: 'Run Payroll', tab: 'payroll', icon: Building2 },
              { label: 'View Reports', tab: 'reports', icon: BarChart3 },
              { label: 'Add Contact', tab: 'contacts', icon: Users },
              { label: 'Journal Entry', tab: 'journal', icon: BookOpen },
            ].map((a, i) => (
              <button key={i} onClick={() => onNavigate(a.tab)} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] hover:border-emerald-500/30 transition-all text-xs text-gray-400 hover:text-emerald-400">
                <a.icon className="w-3.5 h-3.5" /> {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400"><span>Total Contacts</span><span className="text-gray-200">{stats.contactCount || 0}</span></div>
            <div className="flex justify-between text-gray-400"><span>Total Invoices</span><span className="text-gray-200">{stats.invoiceCount || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  GENERIC CRUD TABLE COMPONENT
// ═══════════════════════════════════
function CrudModule({ title, apiName, columns, formFields, emptyIcon, renderForm, customCreate }: {
  title: string; apiName: string; columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  formFields?: any[]; emptyIcon: any; renderForm?: (form: any, setForm: any, isEdit: boolean) => React.ReactNode;
  customCreate?: (data: any) => Promise<any>;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await api()?.[apiName]?.getAll();
    setRows(data || []);
  }

  function openCreate() {
    setEditRow(null);
    setForm({});
    setModalOpen(true);
  }

  function openEdit(row: any) {
    setEditRow(row);
    setForm({ ...row });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editRow) {
        const { id, created_at, ...data } = form;
        await api()[apiName].update(editRow.id, data);
      } else {
        if (customCreate) await customCreate(form);
        else await api()[apiName].create(form);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      alert('Error: ' + (err.message || err));
    }
  }

  async function handleDelete(id: number) {
    if (await confirm(`Delete this ${title.toLowerCase().replace(/s$/, '')}?`)) {
      await api()[apiName].delete(id);
      load();
    }
  }

  return (
    <div className="space-y-3">
      <ConfirmDialog />
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-200">{title}</h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState message={`No ${title.toLowerCase()} yet. Click Add to create one.`} icon={emptyIcon} />
      ) : (
        <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#18181b]/50">
                {columns.map(c => <th key={c.key} className="text-left px-3 py-2.5 text-gray-500 font-medium text-xs">{c.label}</th>)}
                <th className="w-20 px-3 py-2.5 text-gray-500 font-medium text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-[#18181b] transition-colors">
                  {columns.map(c => (
                    <td key={c.key} className="px-3 py-2 text-gray-300 text-xs">
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(row)} className="p-1 text-gray-600 hover:text-emerald-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(row.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editRow ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}>
        <form onSubmit={handleSave} className="space-y-3">
          {renderForm ? renderForm(form, setForm, !!editRow) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#27272a] text-gray-300 text-xs rounded-lg hover:bg-[#3f3f46]">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-black text-xs font-medium rounded-lg hover:bg-emerald-400">{editRow ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════
//  CHART OF ACCOUNTS
// ═══════════════════════════════════
function AccountsView() {
  return (
    <CrudModule
      title="Chart of Accounts" apiName="accounts" emptyIcon={BookOpen}
      columns={[
        { key: 'code', label: 'Code', render: r => <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{r.code}</span> },
        { key: 'name', label: 'Account Name' },
        { key: 'type', label: 'Type', render: r => <span className="capitalize px-2 py-0.5 rounded bg-[#27272a] text-gray-400 text-xs">{r.type}</span> },
        { key: 'description', label: 'Description' },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Account Code" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. 1000" required />
          <Select label="Type" value={form.type || 'asset'} onChange={e => setForm({...form, type: e.target.value})} options={ACCOUNT_TYPES} />
          <div className="col-span-2"><Input label="Account Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="col-span-2"><Input label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  CONTACTS
// ═══════════════════════════════════
function ContactsView() {
  return (
    <CrudModule
      title="Contacts" apiName="contacts" emptyIcon={Users}
      columns={[
        { key: 'name', label: 'Name', render: r => <span className="font-medium text-gray-200">{r.name}</span> },
        { key: 'type', label: 'Type', render: r => <StatusBadge status={r.type === 'customer' ? 'active' : r.type === 'supplier' ? 'sent' : 'completed'} /> },
        { key: 'kra_pin', label: 'KRA PIN', render: r => r.kra_pin ? <span className="font-mono text-xs">{r.kra_pin}</span> : <span className="text-gray-600">—</span> },
        { key: 'phone', label: 'Phone' },
        { key: 'county', label: 'County' },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
          <Select label="Type" value={form.type || 'customer'} onChange={e => setForm({...form, type: e.target.value})} options={[{ value: 'customer', label: 'Customer' }, { value: 'supplier', label: 'Supplier' }, { value: 'employee', label: 'Employee' }]} />
          <Input label="KRA PIN" value={form.kra_pin || ''} onChange={e => setForm({...form, kra_pin: e.target.value})} placeholder="P0123456789A" />
          <Input label="Email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} type="email" />
          <Input label="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
          <Select label="County" value={form.county || 'Nairobi'} onChange={e => setForm({...form, county: e.target.value})} options={KENYA_COUNTIES.map(c => ({ value: c, label: c }))} />
          <div className="col-span-2"><Input label="Address" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} /></div>
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  INVOICING
// ═══════════════════════════════════
function InvoicingView() {
  return (
    <CrudModule
      title="Invoices" apiName="invoices" emptyIcon={Receipt}
      columns={[
        { key: 'invoice_number', label: 'Invoice #', render: r => <span className="font-mono text-emerald-400">{r.invoice_number}</span> },
        { key: 'contact_name', label: 'Client' },
        { key: 'date', label: 'Date' },
        { key: 'vat_amount', label: 'VAT', render: r => formatKES(r.vat_amount || 0) },
        { key: 'total', label: 'Total', render: r => <span className="font-medium text-gray-200">{formatKES(r.total || 0)}</span> },
        { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
      ]}
      renderForm={(form, setForm, isEdit) => {
        const [contacts, setContacts] = useState<any[]>([]);
        const [nextNum, setNextNum] = useState('');
        useEffect(() => {
          api()?.contacts.getAll({ type: 'customer' }).then(setContacts);
          if (!isEdit) api()?.invoices.nextNumber().then(n => { setNextNum(n); setForm((f: any) => ({ ...f, invoice_number: n, type: 'sales', date: today(), status: 'draft' })); });
        }, []);
        const subtotal = parseFloat(form.subtotal || 0);
        const vat = subtotal * 0.16;
        useEffect(() => { setForm((f: any) => ({ ...f, vat_amount: vat, total: subtotal + vat })); }, [subtotal]);
        return (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Invoice #" value={form.invoice_number || nextNum} onChange={e => setForm({...form, invoice_number: e.target.value})} required />
            <Select label="Client" value={form.contact_id || ''} onChange={e => setForm({...form, contact_id: parseInt(e.target.value)})} options={[{ value: '', label: 'Select...' }, ...contacts.map(c => ({ value: String(c.id), label: c.name }))]} />
            <Input label="Date" type="date" value={form.date || today()} onChange={e => setForm({...form, date: e.target.value})} required />
            <Input label="Due Date" type="date" value={form.due_date || ''} onChange={e => setForm({...form, due_date: e.target.value})} />
            <Input label="Subtotal (KES)" type="number" value={form.subtotal || ''} onChange={e => setForm({...form, subtotal: parseFloat(e.target.value) || 0})} />
            <Select label="Status" value={form.status || 'draft'} onChange={e => setForm({...form, status: e.target.value})} options={[{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }]} />
            <Input label="eTIMS Number" value={form.etims_number || ''} onChange={e => setForm({...form, etims_number: e.target.value})} />
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">VAT (16%)</label>
              <div className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-emerald-400">{formatKES(vat)}</div>
            </div>
            <div className="col-span-2"><Textarea label="Notes" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          </div>
        );
      }}
    />
  );
}

// ═══════════════════════════════════
//  EXPENSES
// ═══════════════════════════════════
function ExpensesView() {
  return (
    <CrudModule
      title="Expenses" apiName="expenses" emptyIcon={Wallet}
      columns={[
        { key: 'date', label: 'Date' },
        { key: 'description', label: 'Description' },
        { key: 'category', label: 'Category', render: r => <span className="text-xs px-2 py-0.5 rounded bg-[#27272a] text-gray-400">{r.category || '—'}</span> },
        { key: 'payment_method', label: 'Payment', render: r => <span className="text-xs capitalize px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{(r.payment_method || '').replace('_', ' ')}</span> },
        { key: 'amount', label: 'Amount', render: r => <span className="text-red-400 font-medium">{formatKES(r.amount)}</span> },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={form.date || today()} onChange={e => setForm({...form, date: e.target.value})} required />
          <Input label="Amount (KES)" type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} required />
          <div className="col-span-2"><Input label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} required /></div>
          <Input label="Category" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Rent, Utilities" />
          <Select label="Payment Method" value={form.payment_method || 'cash'} onChange={e => setForm({...form, payment_method: e.target.value})} options={PAYMENT_METHODS} />
          <Input label="Receipt #" value={form.receipt_number || ''} onChange={e => setForm({...form, receipt_number: e.target.value})} />
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  PAYMENTS
// ═══════════════════════════════════
function PaymentsView() {
  return (
    <CrudModule
      title="Payments" apiName="payments" emptyIcon={CreditCard}
      columns={[
        { key: 'date', label: 'Date' },
        { key: 'contact_name', label: 'Contact' },
        { key: 'direction', label: 'Direction', render: r => r.direction === 'in' ? <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Received</span> : <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400">Sent</span> },
        { key: 'payment_method', label: 'Method', render: r => <span className="capitalize text-xs">{(r.payment_method || '').replace('_', ' ')}</span> },
        { key: 'amount', label: 'Amount', render: r => <span className={`font-medium ${r.direction === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>{formatKES(r.amount)}</span> },
        { key: 'reference', label: 'Reference' },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={form.date || today()} onChange={e => setForm({...form, date: e.target.value})} required />
          <Select label="Direction" value={form.direction || 'in'} onChange={e => setForm({...form, direction: e.target.value})} options={[{ value: 'in', label: 'Payment Received' }, { value: 'out', label: 'Payment Sent' }]} />
          <Input label="Amount (KES)" type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} required />
          <Select label="Payment Method" value={form.payment_method || 'mpesa'} onChange={e => setForm({...form, payment_method: e.target.value})} options={PAYMENT_METHODS} />
          <Input label="Reference" value={form.reference || ''} onChange={e => setForm({...form, reference: e.target.value})} />
          <div className="col-span-2"><Input label="Notes" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  PAYROLL
// ═══════════════════════════════════
function PayrollView() {
  const [rows, setRows] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => { load(); api()?.contacts.getAll({ type: 'employee' }).then(setEmployees); }, []);
  async function load() { setRows(await api()?.payroll.getAll() || []); }

  const gross = (parseFloat(form.basic_salary) || 0) + (parseFloat(form.allowances) || 0);
  const paye = calculatePAYE(gross);
  const nhif = calculateNHIF(gross);
  const nssf = calculateNSSF(gross);
  const net = gross - paye - nhif - nssf - (parseFloat(form.other_deductions) || 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, gross_pay: gross, paye: Math.round(paye), nhif, nssf: Math.round(nssf), net_pay: Math.round(net), status: 'completed' };
    if (form.id) { const { id, created_at, employee_name, ...rest } = data; await api().payroll.update(form.id, rest); }
    else { await api().payroll.create(data); }
    setModalOpen(false); load();
  }

  async function handleDelete(id: number) { if (await confirm('Delete this payroll record?')) { await api().payroll.delete(id); load(); } }

  return (
    <div className="space-y-3">
      <ConfirmDialog />
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-200">Payroll</h2>
        <button onClick={() => { setForm({ period: new Date().toISOString().slice(0,7), basic_salary: 0, allowances: 0, other_deductions: 0 }); setModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Run Payroll
        </button>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-[#27272a] bg-[#0a0a0c]">
            <div className="text-xs text-gray-500 mb-1">Total Gross</div>
            <div className="text-lg font-bold text-gray-100">{formatKES(rows.reduce((s, r) => s + (r.gross_pay || 0), 0))}</div>
          </div>
          <div className="p-3 rounded-xl border border-[#27272a] bg-[#0a0a0c]">
            <div className="text-xs text-gray-500 mb-1">Total Deductions</div>
            <div className="text-lg font-bold text-red-400">{formatKES(rows.reduce((s, r) => s + (r.paye || 0) + (r.nhif || 0) + (r.nssf || 0), 0))}</div>
          </div>
          <div className="p-3 rounded-xl border border-[#27272a] bg-[#0a0a0c]">
            <div className="text-xs text-gray-500 mb-1">Total Net Pay</div>
            <div className="text-lg font-bold text-emerald-400">{formatKES(rows.reduce((s, r) => s + (r.net_pay || 0), 0))}</div>
          </div>
        </div>
      )}

      {rows.length === 0 ? <EmptyState message="No payroll records. Click Run Payroll." icon={Building2} /> : (
        <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-[#27272a] bg-[#18181b]/50">
              <th className="text-left px-3 py-2.5 text-gray-500 font-medium">Employee</th>
              <th className="text-left px-3 py-2.5 text-gray-500 font-medium">Period</th>
              <th className="text-right px-3 py-2.5 text-gray-500 font-medium">Gross</th>
              <th className="text-right px-3 py-2.5 text-gray-500 font-medium">PAYE</th>
              <th className="text-right px-3 py-2.5 text-gray-500 font-medium">NHIF</th>
              <th className="text-right px-3 py-2.5 text-gray-500 font-medium">NSSF</th>
              <th className="text-right px-3 py-2.5 text-gray-500 font-medium">Net Pay</th>
              <th className="w-16 px-3 py-2.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-[#27272a]">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-[#18181b]">
                  <td className="px-3 py-2 text-gray-300 font-medium">{r.employee_name || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{r.period}</td>
                  <td className="px-3 py-2 text-right text-gray-200">{formatKES(r.gross_pay)}</td>
                  <td className="px-3 py-2 text-right text-red-400">{formatKES(r.paye)}</td>
                  <td className="px-3 py-2 text-right text-red-400">{formatKES(r.nhif)}</td>
                  <td className="px-3 py-2 text-right text-red-400">{formatKES(r.nssf)}</td>
                  <td className="px-3 py-2 text-right text-emerald-400 font-bold">{formatKES(r.net_pay)}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDelete(r.id)} className="p-1 text-gray-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Run Payroll">
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Employee" value={form.employee_id || ''} onChange={e => setForm({...form, employee_id: parseInt(e.target.value)})} options={[{ value: '', label: 'Select...' }, ...employees.map(e => ({ value: String(e.id), label: e.name }))]} />
            <Input label="Period" type="month" value={form.period || ''} onChange={e => setForm({...form, period: e.target.value})} required />
            <Input label="Basic Salary" type="number" value={form.basic_salary || ''} onChange={e => setForm({...form, basic_salary: e.target.value})} required />
            <Input label="Allowances" type="number" value={form.allowances || ''} onChange={e => setForm({...form, allowances: e.target.value})} />
            <Input label="Other Deductions" type="number" value={form.other_deductions || ''} onChange={e => setForm({...form, other_deductions: e.target.value})} />
          </div>
          <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-[#18181b] border border-[#27272a]">
            <div><div className="text-[10px] text-gray-500">Gross</div><div className="text-sm font-bold text-gray-200">{formatKES(gross)}</div></div>
            <div><div className="text-[10px] text-gray-500">PAYE</div><div className="text-sm font-bold text-red-400">{formatKES(Math.round(paye))}</div></div>
            <div><div className="text-[10px] text-gray-500">NHIF+NSSF</div><div className="text-sm font-bold text-red-400">{formatKES(nhif + Math.round(nssf))}</div></div>
            <div><div className="text-[10px] text-gray-500">Net Pay</div><div className="text-sm font-bold text-emerald-400">{formatKES(Math.round(net))}</div></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#27272a] text-gray-300 text-xs rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-black text-xs font-medium rounded-lg">Process Payroll</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════
//  INVENTORY
// ═══════════════════════════════════
function InventoryView() {
  return (
    <CrudModule title="Inventory" apiName="inventory" emptyIcon={Package}
      columns={[
        { key: 'sku', label: 'SKU', render: r => <span className="font-mono text-xs text-cyan-400">{r.sku || '—'}</span> },
        { key: 'name', label: 'Item Name', render: r => <span className="font-medium text-gray-200">{r.name}</span> },
        { key: 'category', label: 'Category' },
        { key: 'quantity_on_hand', label: 'Qty', render: r => <span className={r.quantity_on_hand <= r.reorder_level ? 'text-red-400 font-medium' : 'text-gray-300'}>{r.quantity_on_hand}</span> },
        { key: 'unit_cost', label: 'Unit Cost', render: r => formatKES(r.unit_cost) },
        { key: 'selling_price', label: 'Selling Price', render: r => formatKES(r.selling_price) },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Item Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="SKU" value={form.sku || ''} onChange={e => setForm({...form, sku: e.target.value})} />
          <Input label="Category" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} />
          <Input label="Quantity" type="number" value={form.quantity_on_hand || ''} onChange={e => setForm({...form, quantity_on_hand: parseInt(e.target.value) || 0})} />
          <Input label="Unit Cost (KES)" type="number" value={form.unit_cost || ''} onChange={e => setForm({...form, unit_cost: parseFloat(e.target.value) || 0})} />
          <Input label="Selling Price (KES)" type="number" value={form.selling_price || ''} onChange={e => setForm({...form, selling_price: parseFloat(e.target.value) || 0})} />
          <Input label="Reorder Level" type="number" value={form.reorder_level || ''} onChange={e => setForm({...form, reorder_level: parseInt(e.target.value) || 0})} />
          <div className="col-span-2"><Input label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  FIXED ASSETS
// ═══════════════════════════════════
function AssetsView() {
  return (
    <CrudModule title="Fixed Assets" apiName="assets" emptyIcon={Landmark}
      columns={[
        { key: 'name', label: 'Asset Name', render: r => <span className="font-medium text-gray-200">{r.name}</span> },
        { key: 'category', label: 'Category' },
        { key: 'purchase_date', label: 'Purchase Date' },
        { key: 'purchase_cost', label: 'Cost', render: r => formatKES(r.purchase_cost) },
        { key: 'useful_life_years', label: 'Life (yrs)' },
        { key: 'depreciation_method', label: 'Method', render: r => <span className="capitalize text-xs">{(r.depreciation_method || '').replace('_', ' ')}</span> },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Asset Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Category" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Equipment, Vehicle" />
          <Input label="Purchase Date" type="date" value={form.purchase_date || today()} onChange={e => setForm({...form, purchase_date: e.target.value})} />
          <Input label="Purchase Cost (KES)" type="number" value={form.purchase_cost || ''} onChange={e => setForm({...form, purchase_cost: parseFloat(e.target.value) || 0})} />
          <Input label="Useful Life (years)" type="number" value={form.useful_life_years || 5} onChange={e => setForm({...form, useful_life_years: parseInt(e.target.value) || 5})} />
          <Input label="Salvage Value (KES)" type="number" value={form.salvage_value || ''} onChange={e => setForm({...form, salvage_value: parseFloat(e.target.value) || 0})} />
          <Select label="Depreciation Method" value={form.depreciation_method || 'straight_line'} onChange={e => setForm({...form, depreciation_method: e.target.value})} options={[{ value: 'straight_line', label: 'Straight Line' }, { value: 'reducing_balance', label: 'Reducing Balance' }]} />
          <div className="col-span-2"><Input label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  JOURNAL ENTRIES
// ═══════════════════════════════════
function JournalView() {
  return (
    <CrudModule title="Journal Entries" apiName="journal" emptyIcon={BookOpen}
      columns={[
        { key: 'date', label: 'Date' },
        { key: 'reference', label: 'Reference', render: r => <span className="font-mono text-xs text-cyan-400">{r.reference || '—'}</span> },
        { key: 'description', label: 'Description', render: r => <span className="text-gray-200">{r.description}</span> },
      ]}
      renderForm={(form, setForm) => (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={form.date || today()} onChange={e => setForm({...form, date: e.target.value})} required />
          <Input label="Reference" value={form.reference || ''} onChange={e => setForm({...form, reference: e.target.value})} />
          <div className="col-span-2"><Input label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} required /></div>
        </div>
      )}
    />
  );
}

// ═══════════════════════════════════
//  REPORTS
// ═══════════════════════════════════
function ReportsView() {
  const [activeReport, setActiveReport] = useState('trial_balance');
  const [data, setData] = useState<any>(null);

  useEffect(() => { loadReport(); }, [activeReport]);

  async function loadReport() {
    setData(null);
    if (activeReport === 'trial_balance') setData(await api()?.reports.trialBalance());
    else if (activeReport === 'profit_loss') setData(await api()?.reports.profitLoss());
    else if (activeReport === 'balance_sheet') setData(await api()?.reports.balanceSheet());
  }

  const renderTrialBalance = () => {
    if (!data) return <div className="text-gray-500 p-4 text-xs">Loading...</div>;
    const items = (data as any[]).filter(r => r.total_debit > 0 || r.total_credit > 0);
    if (items.length === 0) return <EmptyState message="No account balances found." icon={BarChart3} />;
    return (
      <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-[#27272a] bg-[#18181b]/50">
            <th className="text-left px-3 py-2.5 text-gray-500">Code</th>
            <th className="text-left px-3 py-2.5 text-gray-500">Account</th>
            <th className="text-right px-3 py-2.5 text-gray-500">Debit</th>
            <th className="text-right px-3 py-2.5 text-gray-500">Credit</th>
          </tr></thead>
          <tbody className="divide-y divide-[#27272a]">
            {items.map((r, i) => (
              <tr key={i} className="hover:bg-[#18181b]">
                <td className="px-3 py-2 font-mono text-emerald-400">{r.code}</td>
                <td className="px-3 py-2 text-gray-300">{r.name}</td>
                <td className="px-3 py-2 text-right text-gray-200">{r.total_debit > 0 ? formatKES(r.total_debit) : ''}</td>
                <td className="px-3 py-2 text-right text-gray-200">{r.total_credit > 0 ? formatKES(r.total_credit) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProfitLoss = () => {
    if (!data) return <div className="text-gray-500 p-4 text-xs">Loading...</div>;
    if (data.revenue?.length === 0 && data.expenses?.length === 0) return <EmptyState message="No revenue or expenses recorded yet." icon={BarChart3} />;
    return (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-4">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">Revenue</h3>
            {data.revenue?.map((r: any, i: number) => (
              <div key={i} className="flex justify-between text-xs py-1"><span className="text-gray-400">{r.code} — {r.name}</span><span className="text-gray-200">{formatKES(r.amount)}</span></div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-[#27272a]"><span className="text-emerald-400">Total Revenue</span><span className="text-emerald-400">{formatKES(data.totalRevenue)}</span></div>
          </div>
          <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-2">Expenses</h3>
            {data.expenses?.map((r: any, i: number) => (
              <div key={i} className="flex justify-between text-xs py-1"><span className="text-gray-400">{r.code} — {r.name}</span><span className="text-gray-200">{formatKES(r.amount)}</span></div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-[#27272a]"><span className="text-red-400">Total Expenses</span><span className="text-red-400">{formatKES(data.totalExpenses)}</span></div>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-200">Net Profit / (Loss)</span>
            <span className={`text-xl font-bold ${data.totalRevenue - data.totalExpenses >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatKES(data.totalRevenue - data.totalExpenses)}</span>
          </div>
        </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!data) return <div className="text-gray-500 p-4 text-xs">Loading...</div>;
    const hasData = (data.assets?.length || 0) + (data.liabilities?.length || 0) + (data.equity?.length || 0) > 0;
    if (!hasData) return <EmptyState message="No balance sheet data available." icon={BarChart3} />;
    return (
        <div className="space-y-4">
          {[{ title: 'Assets', items: data.assets, color: 'text-cyan-400' }, { title: 'Liabilities', items: data.liabilities, color: 'text-yellow-400' }, { title: 'Equity', items: data.equity, color: 'text-emerald-400' }].map(section => (
            <div key={section.title} className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-4">
              <h3 className={`text-sm font-semibold ${section.color} mb-2`}>{section.title}</h3>
              {section.items?.map((r: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1"><span className="text-gray-400">{r.code} — {r.name}</span><span className="text-gray-200">{formatKES(Math.abs(r.balance))}</span></div>
              ))}
              <div className={`flex justify-between text-sm font-bold pt-2 mt-2 border-t border-[#27272a]`}><span className={section.color}>Total {section.title}</span><span className={section.color}>{formatKES(Math.abs(section.items?.reduce((s: number, r: any) => s + r.balance, 0) || 0))}</span></div>
            </div>
          ))}
        </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[{ id: 'trial_balance', label: 'Trial Balance' }, { id: 'profit_loss', label: 'Profit & Loss' }, { id: 'balance_sheet', label: 'Balance Sheet' }].map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeReport === r.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#27272a] text-gray-400 border border-transparent hover:bg-[#3f3f46]'}`}>{r.label}</button>
        ))}
      </div>
      {activeReport === 'trial_balance' && renderTrialBalance()}
      {activeReport === 'profit_loss' && renderProfitLoss()}
      {activeReport === 'balance_sheet' && renderBalanceSheet()}
    </div>
  );
}

// ═══════════════════════════════════
//  KRA PORTALS BROWSER
// ═══════════════════════════════════
function BrowserView() {
  const [activePortal, setActivePortal] = useState(KRA_PORTALS[0]);
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {KRA_PORTALS.map(p => (
          <button key={p.name} onClick={() => setActivePortal(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePortal.name === p.name ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#27272a] text-gray-400 border border-transparent hover:bg-[#3f3f46]'}`}>{p.name}</button>
        ))}
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border border-[#27272a] bg-white min-h-0">
        {/* @ts-ignore */}
        <webview key={activePortal.url} src={activePortal.url} style={{ width: '100%', height: '100%' }} allowpopups="true"></webview>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════
function SettingsView({ onProfileUpdate }: { onProfileUpdate?: (name: string) => void }) {
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => { 
    if (!api()?.settings) {
      alert("Backend settings module not loaded. Please completely close the app and restart it.");
      return;
    }
    api()?.settings.getAll().then(d => { if (d) setSettings(d); }); 
  }, []);

  async function handleSave() { 
    try {
      if (!api()?.settings) throw new Error("Backend not loaded. Please restart the app.");
      for (const [k, v] of Object.entries(settings)) await api()?.settings.update(k, v as string); 
      if (onProfileUpdate && settings.admin_name) onProfileUpdate(settings.admin_name);
      alert('Profile & Settings Saved!'); 
    } catch (e: any) {
      alert('Error saving: ' + e.message);
    }
  }

  return (
    <div className="space-y-5 max-w-3xl pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-200">User Profile & Settings</h2>
        <button onClick={handleSave} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium rounded-lg">Save Changes</button>
      </div>

      <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-5">
        <h3 className="text-sm font-semibold text-emerald-400 mb-4">Admin Profile</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Admin Name" value={settings.admin_name || ''} onChange={e => setSettings({...settings, admin_name: e.target.value})} placeholder="e.g. John Doe" />
          <Input label="Admin Email" value={settings.admin_email || ''} onChange={e => setSettings({...settings, admin_email: e.target.value})} type="email" placeholder="admin@example.com" />
        </div>
      </div>

      <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-5">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">Company Profile</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Company Name" value={settings.company_name || ''} onChange={e => setSettings({...settings, company_name: e.target.value})} />
          <Input label="KRA PIN" value={settings.kra_pin || ''} onChange={e => setSettings({...settings, kra_pin: e.target.value})} placeholder="P0123456789A" />
          <Input label="VAT Number" value={settings.vat_number || ''} onChange={e => setSettings({...settings, vat_number: e.target.value})} />
          <Input label="VAT Rate (%)" value={settings.vat_rate || '16'} onChange={e => setSettings({...settings, vat_rate: e.target.value})} type="number" />
          <Input label="Company Email" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} type="email" />
          <Input label="Phone" value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
          <Select label="County" value={settings.county || 'Nairobi'} onChange={e => setSettings({...settings, county: e.target.value})} options={KENYA_COUNTIES.map(c => ({ value: c, label: c }))} />
          <div className="col-span-2"><Input label="Address" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-[#27272a] bg-[#0a0a0c] p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">Data Management</h3>
        <div className="flex gap-2">
          <button onClick={() => api()?.db.backup().then((r: any) => r.success && alert('Backup saved to: ' + r.path))} className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 text-xs rounded-lg">📦 Backup Database</button>
          <button onClick={() => api()?.db.restore().then((r: any) => r.success && alert('Restored! Restart the app.'))} className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 text-xs rounded-lg">📥 Restore from Backup</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    api()?.settings.getAll().then(d => { if (d && d.admin_name) setAdminName(d.admin_name); });
  }, [activeTab]);

  const nav = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'spreadsheet', name: 'Spreadsheet', icon: FileSpreadsheet },
    { id: 'accounts', name: 'Chart of Accounts', icon: BookOpen },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'journal', name: 'Journal Entries', icon: ClipboardList },
    { id: 'invoicing', name: 'Invoicing', icon: Receipt },
    { id: 'expenses', name: 'Expenses', icon: Wallet },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'payroll', name: 'Payroll & HR', icon: Building2 },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'assets', name: 'Fixed Assets', icon: Landmark },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'portals', name: 'Government Portals', icon: Globe },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  function renderView() {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onNavigate={setActiveTab} />;
      case 'spreadsheet': return <div className="h-full w-full"><SpreadsheetView /></div>;
      case 'accounts': return <AccountsView />;
      case 'contacts': return <ContactsView />;
      case 'journal': return <JournalView />;
      case 'invoicing': return <InvoicingView />;
      case 'expenses': return <ExpensesView />;
      case 'payments': return <PaymentsView />;
      case 'payroll': return <PayrollView />;
      case 'inventory': return <InventoryView />;
      case 'assets': return <AssetsView />;
      case 'reports': return <ReportsView />;
      case 'portals': return <BrowserView />;
      case 'settings': return <SettingsView onProfileUpdate={setAdminName} />;
      default: return <DashboardView onNavigate={setActiveTab} />;
    }
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden font-sans">
      <aside className="w-52 flex-shrink-0 border-r border-[#27272a] bg-[#09090b] flex flex-col">
        <div className="h-12 flex items-center px-4 border-b border-[#27272a]">
          <Calculator className="w-4 h-4 text-emerald-500 mr-2" />
          <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">KenyaBooks</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {nav.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all ${active ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500 hover:bg-[#18181b] hover:text-gray-300'}`}>
                <item.icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-gray-600'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-t border-[#27272a]">
          <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-2 px-2 py-1 hover:bg-[#18181b] rounded-lg transition-colors text-left focus:outline-none">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-[10px] font-bold">{(adminName || 'A').charAt(0).toUpperCase()}</div>
            <span className="text-[11px] text-gray-400">{adminName || 'Admin'}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-12 flex-shrink-0 border-b border-[#27272a] flex items-center px-5 justify-between">
          <h1 className="text-xs font-semibold text-gray-300">{nav.find(n => n.id === activeTab)?.name}</h1>
          <span className="text-[10px] text-gray-600 px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a]">Offline · KES</span>
        </header>
        <div className="flex-1 overflow-auto p-4">{renderView()}</div>
      </main>
    </div>
  );
}
