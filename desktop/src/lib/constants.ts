// ── Kenya 2024/25 Tax Constants ──

export const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay',
  'Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii',
  'Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera',
  'Marsabit','Meru','Migori','Mombasa','Murang\'a','Nairobi','Nakuru','Nandi',
  'Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita-Taveta',
  'Tana River','Tharaka-Nithi','Trans-Nzoia','Turkana','Uasin Gishu','Vihiga',
  'Wajir','West Pokot'
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
];

export const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
];

export const WHT_RATES = [
  { value: 5, label: '5% — Management/Professional fees (resident)' },
  { value: 10, label: '10% — Rent (immovable property)' },
  { value: 15, label: '15% — Interest / Dividends (resident)' },
  { value: 20, label: '20% — Management fees (non-resident)' },
  { value: 30, label: '30% — Royalties (non-resident)' },
];

export const DEPRECIATION_METHODS = [
  { value: 'straight_line', label: 'Straight Line' },
  { value: 'reducing_balance', label: 'Reducing Balance' },
];

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;

export const KRA_PORTALS = [
  { name: 'KRA iTax', url: 'https://itax.kra.go.ke' },
  { name: 'eTIMS', url: 'https://etims.kra.go.ke' },
  { name: 'SHA', url: 'https://sha.go.ke/' },
  { name: 'NSSF', url: 'https://www.nssf.or.ke' },
  { name: 'CBK Rates', url: 'https://www.centralbank.go.ke' },
  { name: 'PPRA / PPIP', url: 'https://tenders.go.ke' },
];

// ── Tax Calculators ──

export function calculatePAYE(grossPay: number): number {
  const personalRelief = 2400;
  let tax = 0;
  if (grossPay <= 24000) tax = grossPay * 0.10;
  else if (grossPay <= 32333) tax = 24000 * 0.10 + (grossPay - 24000) * 0.25;
  else if (grossPay <= 500000) tax = 24000 * 0.10 + 8333 * 0.25 + (grossPay - 32333) * 0.30;
  else if (grossPay <= 800000) tax = 24000 * 0.10 + 8333 * 0.25 + 467667 * 0.30 + (grossPay - 500000) * 0.325;
  else tax = 24000 * 0.10 + 8333 * 0.25 + 467667 * 0.30 + 300000 * 0.325 + (grossPay - 800000) * 0.35;
  return Math.max(0, tax - personalRelief);
}

export function calculateNHIF(grossPay: number): number {
  if (grossPay <= 5999) return 150;
  if (grossPay <= 7999) return 300;
  if (grossPay <= 11999) return 400;
  if (grossPay <= 14999) return 500;
  if (grossPay <= 19999) return 600;
  if (grossPay <= 24999) return 750;
  if (grossPay <= 29999) return 850;
  if (grossPay <= 34999) return 900;
  if (grossPay <= 39999) return 950;
  if (grossPay <= 44999) return 1000;
  if (grossPay <= 49999) return 1100;
  if (grossPay <= 59999) return 1200;
  if (grossPay <= 69999) return 1300;
  if (grossPay <= 79999) return 1400;
  if (grossPay <= 89999) return 1500;
  if (grossPay <= 99999) return 1600;
  return 1700;
}

export function calculateNSSF(grossPay: number): number {
  const tierI = Math.min(grossPay, 7000) * 0.06;
  const tierII = Math.max(0, Math.min(grossPay, 36000) - 7000) * 0.06;
  return tierI + tierII;
}

export function calculateVAT(amount: number, rate: number = 16): number {
  return amount * (rate / 100);
}

export function calculateWHT(amount: number, rate: number): number {
  return amount * (rate / 100);
}

export function formatKES(amount: number): string {
  return 'KES ' + Math.round(amount).toLocaleString('en-KE');
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
