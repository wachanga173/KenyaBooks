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
