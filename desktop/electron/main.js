import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

app.commandLine.appendSwitch('ignore-certificate-errors');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');

let mainWindow;
let db;

let currentWorkspace = 'Default';

function getWorkspacePath(name) {
  const downloadsPath = app.getPath('downloads');
  if (!name || name === 'Default') return path.join(downloadsPath, 'KenyaBooks');
  return path.join(downloadsPath, 'KenyaBooks', 'Workspaces', name);
}

function initDb(workspaceName = 'Default') {
  try {
    if (db) {
      db.close();
      db = null;
    }
    
    currentWorkspace = workspaceName;
    const Database = require('better-sqlite3');
    const workspacePath = getWorkspacePath(workspaceName);
    
    // Automatically provision workspace folders
    const folders = ['Spreadsheets', 'Payroll', 'Reports', 'Exports'];
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }
    folders.forEach(folder => {
      const p = path.join(workspacePath, folder);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });

    const dbPath = path.join(workspacePath, 'kenya_accounting.sqlite');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('asset','liability','equity','revenue','expense')),
        parent_id INTEGER REFERENCES accounts(id),
        description TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('customer','supplier','employee')),
        kra_pin TEXT DEFAULT '',
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        county TEXT DEFAULT '',
        address TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        contact_id INTEGER REFERENCES contacts(id),
        type TEXT NOT NULL CHECK(type IN ('sales','purchase')),
        date TEXT NOT NULL,
        due_date TEXT,
        subtotal REAL DEFAULT 0,
        vat_amount REAL DEFAULT 0,
        wht_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        notes TEXT DEFAULT '',
        etims_number TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS invoice_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit_price REAL DEFAULT 0,
        vat_rate REAL DEFAULT 16,
        is_vat_exempt INTEGER DEFAULT 0,
        line_total REAL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        reference TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS transaction_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        account_id INTEGER NOT NULL REFERENCES accounts(id),
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        description TEXT DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        account_id INTEGER REFERENCES accounts(id),
        contact_id INTEGER REFERENCES contacts(id),
        amount REAL NOT NULL,
        vat_amount REAL DEFAULT 0,
        description TEXT DEFAULT '',
        category TEXT DEFAULT '',
        payment_method TEXT DEFAULT 'cash',
        receipt_number TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        contact_id INTEGER REFERENCES contacts(id),
        invoice_id INTEGER REFERENCES invoices(id),
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        reference TEXT DEFAULT '',
        direction TEXT NOT NULL CHECK(direction IN ('in','out')),
        notes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS payroll (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL REFERENCES contacts(id),
        period TEXT NOT NULL,
        basic_salary REAL DEFAULT 0,
        allowances REAL DEFAULT 0,
        gross_pay REAL DEFAULT 0,
        paye REAL DEFAULT 0,
        nhif REAL DEFAULT 0,
        nssf REAL DEFAULT 0,
        other_deductions REAL DEFAULT 0,
        net_pay REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        unit_cost REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        quantity_on_hand INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 0,
        category TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT DEFAULT '',
        purchase_date TEXT,
        purchase_cost REAL DEFAULT 0,
        useful_life_years INTEGER DEFAULT 5,
        depreciation_method TEXT DEFAULT 'straight_line',
        salvage_value REAL DEFAULT 0,
        description TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS bank_statements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT DEFAULT '',
        reference TEXT DEFAULT '',
        amount REAL NOT NULL,
        balance REAL DEFAULT 0,
        is_reconciled INTEGER DEFAULT 0,
        matched_transaction_id INTEGER REFERENCES transactions(id),
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Seed defaults
    const sc = db.prepare('SELECT COUNT(*) as c FROM settings').get();
    if (sc.c === 0) {
      const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
      db.transaction(() => {
        ins.run('company_name', 'My Company Ltd');
        ins.run('admin_name', '');
        ins.run('admin_email', '');
        ins.run('kra_pin', '');
        ins.run('vat_number', '');
        ins.run('currency', 'KES');
        ins.run('vat_rate', '16');
        ins.run('county', 'Nairobi');
        ins.run('address', '');
        ins.run('phone', '');
        ins.run('email', '');
      })();
    }
    const ac = db.prepare('SELECT COUNT(*) as c FROM accounts').get();
    if (ac.c === 0) {
      const ins = db.prepare('INSERT OR IGNORE INTO accounts (code, name, type) VALUES (?, ?, ?)');
      db.transaction(() => {
        ins.run('1000','Cash','asset'); ins.run('1010','Bank','asset');
        ins.run('1020','M-Pesa','asset'); ins.run('1100','Accounts Receivable','asset');
        ins.run('1200','Inventory','asset'); ins.run('1300','Prepaid Expenses','asset');
        ins.run('1500','Fixed Assets','asset'); ins.run('1510','Accumulated Depreciation','asset');
        ins.run('2000','Accounts Payable','liability'); ins.run('2100','VAT Payable','liability');
        ins.run('2200','PAYE Payable','liability'); ins.run('2300','NHIF Payable','liability');
        ins.run('2400','NSSF Payable','liability'); ins.run('2500','WHT Payable','liability');
        ins.run('2600','Accrued Expenses','liability'); ins.run('2700','Loans Payable','liability');
        ins.run('3000','Owner Equity','equity'); ins.run('3100','Retained Earnings','equity');
        ins.run('3200','Drawings','equity');
        ins.run('4000','Sales Revenue','revenue'); ins.run('4100','Service Revenue','revenue');
        ins.run('4200','Interest Income','revenue'); ins.run('4300','Other Income','revenue');
        ins.run('5000','Cost of Goods Sold','expense'); ins.run('5100','Salaries & Wages','expense');
        ins.run('5200','Rent Expense','expense'); ins.run('5300','Utilities','expense');
        ins.run('5400','Office Supplies','expense'); ins.run('5500','Transport','expense');
        ins.run('5600','Marketing & Advertising','expense'); ins.run('5700','Depreciation','expense');
        ins.run('5800','Insurance','expense'); ins.run('5900','Professional Fees','expense');
        ins.run('6000','Bank Charges','expense'); ins.run('6100','Bad Debts','expense');
        ins.run('6200','Repairs & Maintenance','expense'); ins.run('6300','Telephone & Internet','expense');
      })();
    }

    // Seed sample transactions if none exist
    const txCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get();
    if (txCount.c === 0) {
      db.transaction(() => {
        const result = db.prepare("INSERT INTO transactions (date, reference, description) VALUES (?, ?, ?)").run(new Date().toISOString().slice(0, 10), 'START-001', 'Initial Capital Injection');
        const txId = result.lastInsertRowid;
        const bankId = db.prepare("SELECT id FROM accounts WHERE code = '1010'").get().id;
        const equityId = db.prepare("SELECT id FROM accounts WHERE code = '3000'").get().id;
        db.prepare("INSERT INTO transaction_lines (transaction_id, account_id, debit, credit) VALUES (?, ?, ?, ?)").run(txId, bankId, 500000, 0);
        db.prepare("INSERT INTO transaction_lines (transaction_id, account_id, debit, credit) VALUES (?, ?, ?, ?)").run(txId, equityId, 0, 500000);
      })();
    }

    console.log('[DB] SQLite initialized at:', dbPath);
  } catch (err) {
    console.error('[DB] Failed to initialize SQLite:', err.message);
    db = null;
  }
}

// ── Generic CRUD helper ──
function crud(table, options = {}) {
  const { joins, orderBy } = options;
  return {
    getAll: (filters) => {
      if (!db) return [];
      let sql = joins ? `SELECT ${table}.*, ${joins.select} FROM ${table} ${joins.join}` : `SELECT * FROM ${table}`;
      const params = [];
      if (filters && Object.keys(filters).length > 0) {
        const clauses = Object.entries(filters).map(([k, v]) => { params.push(v); return `${table}.${k} = ?`; });
        sql += ' WHERE ' + clauses.join(' AND ');
      }
      sql += ` ORDER BY ${orderBy || table + '.id DESC'}`;
      return db.prepare(sql).all(...params);
    },
    getById: (id) => {
      if (!db) return null;
      return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    },
    create: (data) => {
      if (!db) return { error: 'DB not available' };
      const keys = Object.keys(data);
      const vals = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      const result = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).run(...vals);
      return { id: result.lastInsertRowid, ...data };
    },
    update: (id, data) => {
      if (!db) return { error: 'DB not available' };
      const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const vals = [...Object.values(data), id];
      db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`).run(...vals);
      return { id, ...data };
    },
    delete: (id) => {
      if (!db) return { error: 'DB not available' };
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      return { success: true };
    },
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1024, minHeight: 700,
    title: 'KenyaBooks — Accounting Software',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, contextIsolation: true, webviewTag: true,
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

app.whenReady().then(() => {
  initDb();

  // ═══ ACCOUNTS ═══
  const accounts = crud('accounts', { orderBy: 'accounts.code ASC' });
  ipcMain.handle('accounts:getAll', (_e, filters) => accounts.getAll(filters));
  ipcMain.handle('accounts:getById', (_e, id) => accounts.getById(id));
  ipcMain.handle('accounts:create', (_e, data) => accounts.create(data));
  ipcMain.handle('accounts:update', (_e, id, data) => accounts.update(id, data));
  ipcMain.handle('accounts:delete', (_e, id) => accounts.delete(id));

  // ═══ CONTACTS ═══
  const contacts = crud('contacts', { orderBy: 'contacts.name ASC' });
  ipcMain.handle('contacts:getAll', (_e, filters) => contacts.getAll(filters));
  ipcMain.handle('contacts:getById', (_e, id) => contacts.getById(id));
  ipcMain.handle('contacts:create', (_e, data) => contacts.create(data));
  ipcMain.handle('contacts:update', (_e, id, data) => contacts.update(id, data));
  ipcMain.handle('contacts:delete', (_e, id) => contacts.delete(id));

  // ═══ INVOICES ═══
  const invoices = crud('invoices', {
    joins: { select: 'c.name as contact_name, c.kra_pin as contact_kra_pin', join: 'LEFT JOIN contacts c ON invoices.contact_id = c.id' },
    orderBy: 'invoices.id DESC'
  });
  ipcMain.handle('invoices:getAll', (_e, filters) => invoices.getAll(filters));
  ipcMain.handle('invoices:getById', (_e, id) => invoices.getById(id));
  ipcMain.handle('invoices:create', (_e, data) => invoices.create(data));
  ipcMain.handle('invoices:update', (_e, id, data) => invoices.update(id, data));
  ipcMain.handle('invoices:delete', (_e, id) => invoices.delete(id));
  // Invoice Lines
  ipcMain.handle('invoiceLines:getByInvoice', (_e, invoiceId) => {
    if (!db) return [];
    return db.prepare('SELECT * FROM invoice_lines WHERE invoice_id = ?').all(invoiceId);
  });
  ipcMain.handle('invoiceLines:create', (_e, data) => {
    if (!db) return { error: 'DB not available' };
    const r = db.prepare('INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price, vat_rate, is_vat_exempt, line_total) VALUES (?,?,?,?,?,?,?)').run(data.invoice_id, data.description, data.quantity, data.unit_price, data.vat_rate, data.is_vat_exempt ? 1 : 0, data.line_total);
    return { id: r.lastInsertRowid };
  });
  ipcMain.handle('invoiceLines:delete', (_e, id) => {
    if (!db) return { error: 'DB not available' };
    db.prepare('DELETE FROM invoice_lines WHERE id = ?').run(id);
    return { success: true };
  });
  ipcMain.handle('invoiceLines:deleteByInvoice', (_e, invoiceId) => {
    if (!db) return { error: 'DB not available' };
    db.prepare('DELETE FROM invoice_lines WHERE invoice_id = ?').run(invoiceId);
    return { success: true };
  });

  // ═══ JOURNAL ENTRIES (transactions) ═══
  const transactions = crud('transactions', { orderBy: 'transactions.date DESC' });
  ipcMain.handle('journal:getAll', (_e) => transactions.getAll());
  ipcMain.handle('journal:getById', (_e, id) => transactions.getById(id));
  ipcMain.handle('journal:create', (_e, data) => transactions.create(data));
  ipcMain.handle('journal:update', (_e, id, data) => transactions.update(id, data));
  ipcMain.handle('journal:delete', (_e, id) => {
    if (!db) return { error: 'DB not available' };
    db.prepare('DELETE FROM transaction_lines WHERE transaction_id = ?').run(id);
    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    return { success: true };
  });
  ipcMain.handle('journalLines:getByTransaction', (_e, txId) => {
    if (!db) return [];
    return db.prepare('SELECT tl.*, a.code as account_code, a.name as account_name FROM transaction_lines tl LEFT JOIN accounts a ON tl.account_id = a.id WHERE tl.transaction_id = ?').all(txId);
  });
  ipcMain.handle('journalLines:create', (_e, data) => {
    if (!db) return { error: 'DB not available' };
    const r = db.prepare('INSERT INTO transaction_lines (transaction_id, account_id, debit, credit, description) VALUES (?,?,?,?,?)').run(data.transaction_id, data.account_id, data.debit, data.credit, data.description || '');
    return { id: r.lastInsertRowid };
  });
  ipcMain.handle('journalLines:deleteByTransaction', (_e, txId) => {
    if (!db) return { error: 'DB not available' };
    db.prepare('DELETE FROM transaction_lines WHERE transaction_id = ?').run(txId);
    return { success: true };
  });

  // ═══ EXPENSES ═══
  const expenses = crud('expenses', {
    joins: { select: 'a.name as account_name, c.name as contact_name', join: 'LEFT JOIN accounts a ON expenses.account_id = a.id LEFT JOIN contacts c ON expenses.contact_id = c.id' },
    orderBy: 'expenses.date DESC'
  });
  ipcMain.handle('expenses:getAll', (_e, filters) => expenses.getAll(filters));
  ipcMain.handle('expenses:create', (_e, data) => expenses.create(data));
  ipcMain.handle('expenses:update', (_e, id, data) => expenses.update(id, data));
  ipcMain.handle('expenses:delete', (_e, id) => expenses.delete(id));

  // ═══ PAYMENTS ═══
  const payments = crud('payments', {
    joins: { select: 'c.name as contact_name, i.invoice_number', join: 'LEFT JOIN contacts c ON payments.contact_id = c.id LEFT JOIN invoices i ON payments.invoice_id = i.id' },
    orderBy: 'payments.date DESC'
  });
  ipcMain.handle('payments:getAll', (_e, filters) => payments.getAll(filters));
  ipcMain.handle('payments:create', (_e, data) => payments.create(data));
  ipcMain.handle('payments:update', (_e, id, data) => payments.update(id, data));
  ipcMain.handle('payments:delete', (_e, id) => payments.delete(id));

  // ═══ PAYROLL ═══
  const payroll = crud('payroll', {
    joins: { select: 'c.name as employee_name', join: 'LEFT JOIN contacts c ON payroll.employee_id = c.id' },
    orderBy: 'payroll.period DESC'
  });
  ipcMain.handle('payroll:getAll', (_e, filters) => payroll.getAll(filters));
  ipcMain.handle('payroll:create', (_e, data) => payroll.create(data));
  ipcMain.handle('payroll:update', (_e, id, data) => payroll.update(id, data));
  ipcMain.handle('payroll:delete', (_e, id) => payroll.delete(id));

  // ═══ INVENTORY ═══
  const inventory = crud('inventory', { orderBy: 'inventory.name ASC' });
  ipcMain.handle('inventory:getAll', (_e, filters) => inventory.getAll(filters));
  ipcMain.handle('inventory:create', (_e, data) => inventory.create(data));
  ipcMain.handle('inventory:update', (_e, id, data) => inventory.update(id, data));
  ipcMain.handle('inventory:delete', (_e, id) => inventory.delete(id));

  // ═══ ASSETS ═══
  const assets = crud('assets', { orderBy: 'assets.purchase_date DESC' });
  ipcMain.handle('assets:getAll', (_e, filters) => assets.getAll(filters));
  ipcMain.handle('assets:create', (_e, data) => assets.create(data));
  ipcMain.handle('assets:update', (_e, id, data) => assets.update(id, data));
  ipcMain.handle('assets:delete', (_e, id) => assets.delete(id));

  // ═══ BANK STATEMENTS ═══
  const bankStatements = crud('bank_statements', { orderBy: 'bank_statements.date DESC' });
  ipcMain.handle('bank:getAll', (_e) => bankStatements.getAll());
  ipcMain.handle('bank:create', (_e, data) => bankStatements.create(data));
  ipcMain.handle('bank:update', (_e, id, data) => bankStatements.update(id, data));
  ipcMain.handle('bank:delete', (_e, id) => bankStatements.delete(id));
  ipcMain.handle('bank:reconcile', (_e, id, txId) => {
    if (!db) return { error: 'DB not available' };
    db.prepare('UPDATE bank_statements SET is_reconciled = 1, matched_transaction_id = ? WHERE id = ?').run(txId, id);
    return { success: true };
  });

  // ═══ SETTINGS ═══
  ipcMain.handle('settings:getAll', () => {
    if (!db) return {};
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const r = {};
    rows.forEach(row => { r[row.key] = row.value; });
    return r;
  });
  ipcMain.handle('settings:update', (_e, key, value) => {
    if (!db) return { error: 'DB not available' };
    return db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  });

  // ═══ DASHBOARD ═══
  ipcMain.handle('dashboard:stats', () => {
    if (!db) return { revenue: 0, expenses: 0, outstanding: 0, profit: 0, invoiceCount: 0, contactCount: 0 };
    try {
      const rev = db.prepare("SELECT COALESCE(SUM(total),0) as t FROM invoices WHERE type='sales' AND status='paid'").get();
      const exp = db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM expenses").get();
      const out = db.prepare("SELECT COALESCE(SUM(total),0) as t FROM invoices WHERE type='sales' AND status IN ('sent','overdue')").get();
      const ic = db.prepare("SELECT COUNT(*) as c FROM invoices").get();
      const cc = db.prepare("SELECT COUNT(*) as c FROM contacts").get();
      return { revenue: rev.t, expenses: exp.t, outstanding: out.t, profit: rev.t - exp.t, invoiceCount: ic.c, contactCount: cc.c };
    } catch { return { revenue: 0, expenses: 0, outstanding: 0, profit: 0, invoiceCount: 0, contactCount: 0 }; }
  });

  // ═══ REPORTS ═══
  ipcMain.handle('reports:trialBalance', () => {
    if (!db) return [];
    return db.prepare(`
      SELECT a.code, a.name, a.type,
        COALESCE(SUM(tl.debit),0) as total_debit,
        COALESCE(SUM(tl.credit),0) as total_credit
      FROM accounts a
      LEFT JOIN transaction_lines tl ON a.id = tl.account_id
      GROUP BY a.id ORDER BY a.code
    `).all();
  });
  ipcMain.handle('reports:profitLoss', () => {
    if (!db) return { revenue: [], expenses: [], totalRevenue: 0, totalExpenses: 0 };
    const revenue = db.prepare("SELECT a.code, a.name, COALESCE(SUM(tl.credit)-SUM(tl.debit),0) as amount FROM accounts a LEFT JOIN transaction_lines tl ON a.id=tl.account_id WHERE a.type='revenue' GROUP BY a.id ORDER BY a.code").all();
    const expenses = db.prepare("SELECT a.code, a.name, COALESCE(SUM(tl.debit)-SUM(tl.credit),0) as amount FROM accounts a LEFT JOIN transaction_lines tl ON a.id=tl.account_id WHERE a.type='expense' GROUP BY a.id ORDER BY a.code").all();
    return { revenue, expenses, totalRevenue: revenue.reduce((s, r) => s + r.amount, 0), totalExpenses: expenses.reduce((s, r) => s + r.amount, 0) };
  });
  ipcMain.handle('reports:balanceSheet', () => {
    if (!db) return { assets: [], liabilities: [], equity: [] };
    const getByType = (type) => db.prepare(`SELECT a.code, a.name, COALESCE(SUM(tl.debit)-SUM(tl.credit),0) as balance FROM accounts a LEFT JOIN transaction_lines tl ON a.id=tl.account_id WHERE a.type=? GROUP BY a.id ORDER BY a.code`).all(type);
    return { assets: getByType('asset'), liabilities: getByType('liability'), equity: getByType('equity') };
  });

  // ═══ NEXT INVOICE NUMBER ═══
  ipcMain.handle('invoices:nextNumber', () => {
    if (!db) return 'INV-001';
    const last = db.prepare("SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1").get();
    if (!last) return 'INV-001';
    const num = parseInt(last.invoice_number.replace('INV-', '')) + 1;
    return 'INV-' + String(num).padStart(3, '0');
  });

  // ═══ FILE OPS ═══
  ipcMain.handle('file:saveDialog', async (_e, opts) => dialog.showSaveDialog(mainWindow, { title: opts.title || 'Save', defaultPath: opts.defaultPath || 'file', filters: opts.filters || [{ name: 'All', extensions: ['*'] }] }));
  ipcMain.handle('file:openDialog', async (_e, opts) => dialog.showOpenDialog(mainWindow, { title: opts.title || 'Open', filters: opts.filters || [{ name: 'All', extensions: ['*'] }], properties: ['openFile'] }));
  ipcMain.handle('file:write', async (_e, fp, data) => { fs.writeFileSync(fp, Buffer.from(data)); return { success: true }; });
  ipcMain.handle('file:read', async (_e, fp) => fs.readFileSync(fp));

  // ═══ WORKSPACES ═══
  ipcMain.handle('workspace:list', () => {
    const docsPath = app.getPath('documents');
    const base = path.join(docsPath, 'KenyaBooks', 'Workspaces');
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
    const folders = fs.readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    return ['Default', ...folders];
  });
  ipcMain.handle('workspace:create', (_e, name) => {
    if (!name || name === 'Default') return { error: 'Invalid name' };
    initDb(name);
    return { success: true };
  });
  ipcMain.handle('workspace:switch', (_e, name) => {
    initDb(name);
    return { success: true };
  });
  ipcMain.handle('workspace:current', () => currentWorkspace);
  ipcMain.handle('workspace:exportFile', (_e, subfolder, filename, buffer) => {
    const wp = getWorkspacePath(currentWorkspace);
    const targetFolder = path.join(wp, subfolder);
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });
    const fp = path.join(targetFolder, filename);
    fs.writeFileSync(fp, Buffer.from(buffer));
    return { success: true, path: fp };
  });

  // ═══ BACKUP / RESTORE ═══
  ipcMain.handle('db:backup', async () => {
    if (!db) return { error: 'DB not available' };
    const r = await dialog.showSaveDialog(mainWindow, { title: 'Backup', defaultPath: `kenyabooks-backup-${new Date().toISOString().slice(0,10)}.sqlite`, filters: [{ name: 'SQLite', extensions: ['sqlite'] }] });
    if (!r.canceled && r.filePath) { const p = path.join(getWorkspacePath(currentWorkspace), 'kenya_accounting.sqlite'); fs.copyFileSync(p, r.filePath); return { success: true, path: r.filePath }; }
    return { canceled: true };
  });
  ipcMain.handle('db:restore', async () => {
    const r = await dialog.showOpenDialog(mainWindow, { title: 'Restore', filters: [{ name: 'SQLite', extensions: ['sqlite'] }], properties: ['openFile'] });
    if (!r.canceled && r.filePaths.length > 0) { const p = path.join(getWorkspacePath(currentWorkspace), 'kenya_accounting.sqlite'); db.close(); fs.copyFileSync(r.filePaths[0], p); initDb(currentWorkspace); return { success: true }; }
    return { canceled: true };
  });

  ipcMain.handle('app:openExternal', (_e, url) => shell.openExternal(url));

  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
