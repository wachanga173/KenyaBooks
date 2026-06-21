const { contextBridge, ipcRenderer } = require('electron');

// Generic CRUD wrapper
function crudAPI(entity) {
  return {
    getAll: (filters) => ipcRenderer.invoke(`${entity}:getAll`, filters),
    getById: (id) => ipcRenderer.invoke(`${entity}:getById`, id),
    create: (data) => ipcRenderer.invoke(`${entity}:create`, data),
    update: (id, data) => ipcRenderer.invoke(`${entity}:update`, id, data),
    delete: (id) => ipcRenderer.invoke(`${entity}:delete`, id),
  };
}

contextBridge.exposeInMainWorld('api', {
  // Full CRUD for each module
  accounts: crudAPI('accounts'),
  contacts: crudAPI('contacts'),
  invoices: {
    ...crudAPI('invoices'),
    nextNumber: () => ipcRenderer.invoke('invoices:nextNumber'),
  },
  invoiceLines: {
    getByInvoice: (id) => ipcRenderer.invoke('invoiceLines:getByInvoice', id),
    create: (data) => ipcRenderer.invoke('invoiceLines:create', data),
    delete: (id) => ipcRenderer.invoke('invoiceLines:delete', id),
    deleteByInvoice: (id) => ipcRenderer.invoke('invoiceLines:deleteByInvoice', id),
  },
  journal: {
    ...crudAPI('journal'),
  },
  journalLines: {
    getByTransaction: (id) => ipcRenderer.invoke('journalLines:getByTransaction', id),
    create: (data) => ipcRenderer.invoke('journalLines:create', data),
    deleteByTransaction: (id) => ipcRenderer.invoke('journalLines:deleteByTransaction', id),
  },
  expenses: crudAPI('expenses'),
  payments: crudAPI('payments'),
  payroll: crudAPI('payroll'),
  inventory: crudAPI('inventory'),
  assets: crudAPI('assets'),
  bank: {
    getAll: () => ipcRenderer.invoke('bank:getAll'),
    create: (data) => ipcRenderer.invoke('bank:create', data),
    update: (id, data) => ipcRenderer.invoke('bank:update', id, data),
    delete: (id) => ipcRenderer.invoke('bank:delete', id),
    reconcile: (id, txId) => ipcRenderer.invoke('bank:reconcile', id, txId),
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    update: (key, value) => ipcRenderer.invoke('settings:update', key, value),
  },
  dashboard: {
    stats: () => ipcRenderer.invoke('dashboard:stats'),
  },
  reports: {
    trialBalance: () => ipcRenderer.invoke('reports:trialBalance'),
    profitLoss: () => ipcRenderer.invoke('reports:profitLoss'),
    balanceSheet: () => ipcRenderer.invoke('reports:balanceSheet'),
  },
  // File operations
  file: {
    saveDialog: (opts) => ipcRenderer.invoke('file:saveDialog', opts),
    openDialog: (opts) => ipcRenderer.invoke('file:openDialog', opts),
    write: (fp, data) => ipcRenderer.invoke('file:write', fp, data),
    read: (fp) => ipcRenderer.invoke('file:read', fp),
  },
  workspace: {
    list: () => ipcRenderer.invoke('workspace:list'),
    create: (name) => ipcRenderer.invoke('workspace:create', name),
    switch: (name) => ipcRenderer.invoke('workspace:switch', name),
    current: () => ipcRenderer.invoke('workspace:current'),
    exportFile: (subfolder, filename, buffer) => ipcRenderer.invoke('workspace:exportFile', subfolder, filename, buffer),
  },
  db: {
    backup: () => ipcRenderer.invoke('db:backup'),
    restore: () => ipcRenderer.invoke('db:restore'),
  },
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
});
