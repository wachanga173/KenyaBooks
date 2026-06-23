import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, HeadingLevel } from 'docx';

export interface ExportColumn {
  key: string;
  label: string;
}

const api = () => (window as any).api;

function prepareData(rows: any[], columns: ExportColumn[]) {
  return rows.map(row => {
    const formatted: any = {};
    columns.forEach(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      formatted[col.label] = val;
    });
    return formatted;
  });
}

async function saveExportSilent(filename: string, buffer: ArrayBuffer | Uint8Array) {
  try {
    const res = await api()?.workspace.exportFile('Exports', filename, buffer);
    if (res?.success) alert(`Exported successfully to: \n${res.path}`);
  } catch (err: any) {
    alert('Failed to save export: ' + err.message);
  }
}

export function exportToExcel(rows: any[], columns: ExportColumn[], title: string) {
  const data = prepareData(rows, columns);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveExportSilent(`${title.replace(/\s+/g, '_')}_Export.xlsx`, buffer);
}

export function exportToPDF(rows: any[], columns: ExportColumn[], title: string) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  const tableColumn = columns.map(c => c.label);
  const tableRows = rows.map(row => columns.map(c => {
    let val = row[c.key];
    if (val === null || val === undefined) return '';
    return String(val);
  }));

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  const buffer = doc.output('arraybuffer');
  saveExportSilent(`${title.replace(/\s+/g, '_')}_Export.pdf`, buffer);
}

export async function exportToWord(rows: any[], columns: ExportColumn[], title: string) {
  const tableHeaders = new TableRow({
    children: columns.map(c => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: c.label, bold: true })] })],
      shading: { fill: "10B981" }
    })),
  });

  const tableDataRows = rows.map(row => new TableRow({
    children: columns.map(c => {
      let val = row[c.key];
      if (val === null || val === undefined) val = '';
      return new TableCell({
        children: [new Paragraph(String(val))],
      });
    })
  }));

  const table = new Table({
    rows: [tableHeaders, ...tableDataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
        }),
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const buffer = await blob.arrayBuffer();
  saveExportSilent(`${title.replace(/\s+/g, '_')}_Export.docx`, buffer);
}

export async function importFromExcel(file: File, columns: ExportColumn[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map excel labels back to database keys
        const mappedRows = jsonData.map((row: any) => {
          const mappedRow: any = {};
          columns.forEach(col => {
            if (row[col.label] !== undefined) {
              mappedRow[col.key] = row[col.label];
            }
          });
          return mappedRow;
        });
        
        resolve(mappedRows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

// ── Print Table Data ──
export function printTable(rows: any[], columns: ExportColumn[], title: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1a1a1a; }
        h1 { font-size: 20px; margin-bottom: 4px; color: #111; }
        .subtitle { font-size: 11px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #10b981; color: white; text-align: left; padding: 8px 10px; font-weight: 600; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 20px; font-size: 10px; color: #999; text-align: center; }
        @media print { body { padding: 15px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="subtitle">Printed on ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })} · ${rows.length} record(s)</div>
      <table>
        <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${columns.map(c => {
          let val = row[c.key];
          if (val === null || val === undefined) val = '';
          return `<td>${val}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table>
      <div class="footer">KenyaBooks Accounting Software</div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// ── Generate Invoice PDF ──
export async function generateInvoicePDF(invoice: any, settings: any) {
  const doc = new jsPDF();
  const np = (val: any) => val && String(val).trim() ? String(val) : 'Not Provided';
  const formatAmount = (amt: number) => 'KES ' + Math.round(amt || 0).toLocaleString('en-KE');

  // ── Header: Company Info ──
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(np(settings.company_name), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`KRA PIN: ${np(settings.kra_pin)}  |  VAT: ${np(settings.vat_number)}`, 14, 26);
  doc.text(`${np(settings.email)}  |  ${np(settings.phone)}  |  ${np(settings.county)}`, 14, 33);

  // ── INVOICE label (right side of header) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('INVOICE', 196, 22, { align: 'right' });

  // ── Invoice details section ──
  let y = 52;
  doc.setTextColor(30, 30, 30);

  // Left column: Bill To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('BILL TO', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(np(invoice.contact_name), 14, y + 7);
  if (invoice.contact_kra_pin) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`KRA PIN: ${invoice.contact_kra_pin}`, 14, y + 14);
  }

  // Right column: Invoice meta
  const rightX = 196;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('INVOICE #', rightX, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text(np(invoice.invoice_number), rightX, y + 7, { align: 'right' });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Date: ${np(invoice.date)}`, rightX, y + 16, { align: 'right' });
  doc.text(`Due: ${np(invoice.due_date)}`, rightX, y + 22, { align: 'right' });
  if (invoice.etims_number) {
    doc.text(`eTIMS: ${invoice.etims_number}`, rightX, y + 28, { align: 'right' });
  }

  // ── Status badge ──
  y = 90;
  const status = (invoice.status || 'draft').toUpperCase();
  const statusColors: Record<string, [number, number, number]> = {
    'PAID': [16, 185, 129], 'SENT': [234, 179, 8], 'OVERDUE': [239, 68, 68], 'DRAFT': [156, 163, 175]
  };
  const sColor = statusColors[status] || statusColors['DRAFT'];
  doc.setFillColor(sColor[0], sColor[1], sColor[2]);
  const statusWidth = doc.getTextWidth(status) + 12;
  doc.roundedRect(14, y - 5, statusWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(status, 14 + statusWidth / 2, y, { align: 'center' });

  // ── Line separator ──
  y = 102;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);

  // ── Amounts table ──
  y = 112;
  doc.setTextColor(30, 30, 30);

  const amountRows = [
    { label: 'Subtotal', value: formatAmount(invoice.subtotal || 0) },
    { label: 'VAT (16%)', value: formatAmount(invoice.vat_amount || 0) },
  ];
  if (invoice.wht_amount && invoice.wht_amount > 0) {
    amountRows.push({ label: 'WHT', value: formatAmount(invoice.wht_amount) });
  }

  (doc as any).autoTable({
    startY: y,
    head: [['Description', 'Amount']],
    body: amountRows.map(r => [r.label, r.value]),
    theme: 'plain',
    headStyles: { fillColor: [245, 245, 245], textColor: [80, 80, 80], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 10, textColor: [30, 30, 30] },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 'auto', halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  // ── Total line ──
  const finalY = (doc as any).lastAutoTable.finalY + 4;
  doc.setFillColor(16, 185, 129);
  doc.rect(14, finalY, 182, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', 20, finalY + 9);
  doc.text(formatAmount(invoice.total || 0), 190, finalY + 9, { align: 'right' });

  // ── Notes ──
  if (invoice.notes && String(invoice.notes).trim()) {
    const notesY = finalY + 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('NOTES', 14, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(lines, 14, notesY + 7);
  }

  // ── Admin / Footer ──
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, pageHeight - 25, 196, pageHeight - 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Prepared by: ${np(settings.admin_name)}  ·  ${np(settings.admin_email)}`, 14, pageHeight - 18);
  doc.text(`${np(settings.address)}`, 14, pageHeight - 13);
  doc.text('Generated by KenyaBooks Accounting Software', 196, pageHeight - 13, { align: 'right' });

  // ── Save ──
  const filename = `Invoice_${(invoice.invoice_number || 'DRAFT').replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  const buffer = doc.output('arraybuffer');
  await saveExportSilent(filename, buffer);
}

