interface CrudAPI<T = any> {
  getAll: (filters?: Record<string, any>) => Promise<T[]>;
  getById: (id: number) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T & { id: number }>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<{ success: boolean }>;
}

interface WindowAPI {
  accounts: CrudAPI;
  contacts: CrudAPI;
  invoices: CrudAPI & { nextNumber: () => Promise<string> };
  invoiceLines: {
    getByInvoice: (id: number) => Promise<any[]>;
    create: (data: any) => Promise<{ id: number }>;
    delete: (id: number) => Promise<{ success: boolean }>;
    deleteByInvoice: (id: number) => Promise<{ success: boolean }>;
  };
  journal: CrudAPI;
  journalLines: {
    getByTransaction: (id: number) => Promise<any[]>;
    create: (data: any) => Promise<{ id: number }>;
    deleteByTransaction: (id: number) => Promise<{ success: boolean }>;
  };
  expenses: CrudAPI;
  payments: CrudAPI;
  payroll: CrudAPI;
  inventory: CrudAPI;
  assets: CrudAPI;
  bank: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<{ success: boolean }>;
    reconcile: (id: number, txId: number) => Promise<{ success: boolean }>;
  };
  settings: {
    getAll: () => Promise<Record<string, string>>;
    update: (key: string, value: string) => Promise<any>;
  };
  dashboard: { stats: () => Promise<any> };
  reports: {
    trialBalance: () => Promise<any[]>;
    profitLoss: () => Promise<any>;
    balanceSheet: () => Promise<any>;
  };
  file: {
    saveDialog: (opts: any) => Promise<any>;
    openDialog: (opts: any) => Promise<any>;
    write: (fp: string, data: any) => Promise<{ success: boolean }>;
    read: (fp: string) => Promise<Buffer>;
  };
  db: {
    backup: () => Promise<any>;
    restore: () => Promise<any>;
  };
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    api: WindowAPI;
  }
}

export {};
