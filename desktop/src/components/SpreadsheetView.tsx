import React, { useState } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import LuckyExcel from 'luckyexcel';

const SpreadsheetView = () => {
  const [data, setData] = useState<any[]>([{ name: "Sheet1", color: "", status: "1", order: "0", data: [], config: {}, index: 0 }]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    LuckyExcel.transformExcelToLucky(file, (exportJson: any) => {
      if (exportJson.sheets == null || exportJson.sheets.length === 0) {
        alert("Failed to read the excel file (must be .xlsx format).");
        return;
      }
      // FortuneSheet expects the first sheet to be active
      const sheets = exportJson.sheets.map((sheet: any) => ({
        ...sheet,
        status: sheet.index === exportJson.info.index ? "1" : "0"
      }));
      setData(sheets);
    });
  };

  const handleSave = async () => {
    try {
      // @ts-ignore
      const currentData = window.luckysheet?.getAllSheets() || data;
      const json = JSON.stringify(currentData);
      const r = await (window as any).api?.file.saveDialog({
        title: 'Save Spreadsheet',
        defaultPath: 'financial_model.json',
        filters: [{ name: 'JSON Spreadsheets', extensions: ['json'] }]
      });
      if (!r.canceled && r.filePath) {
        await (window as any).api?.file.write(r.filePath, json);
        alert('Spreadsheet saved successfully!');
      }
    } catch (e: any) {
      alert('Failed to save: ' + e.message);
    }
  };

  const handleOpen = async () => {
    try {
      const r = await (window as any).api?.file.openDialog({
        title: 'Open Spreadsheet',
        filters: [{ name: 'JSON Spreadsheets', extensions: ['json'] }]
      });
      if (!r.canceled && r.filePaths.length > 0) {
        const buffer = await (window as any).api?.file.read(r.filePaths[0]);
        const json = new TextDecoder().decode(buffer);
        const parsed = JSON.parse(json);
        setData(parsed);
      }
    } catch (e: any) {
      alert('Failed to open: ' + e.message);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#09090b] rounded-lg border border-[#27272a] overflow-hidden">
      <div className="h-12 border-b border-[#27272a] bg-[#0a0a0c] flex items-center px-4 justify-between flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-200">Financial Modeling</h2>
        <div className="flex gap-2">
          <button onClick={handleOpen} className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 text-xs font-medium rounded-lg transition-colors">
            Open File
          </button>
          <button onClick={handleSave} className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 text-xs font-medium rounded-lg transition-colors">
            Save File
          </button>
          <label className="cursor-pointer px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium rounded-lg transition-colors">
            Import Excel (.xlsx)
            <input type="file" className="hidden" accept=".xlsx" onChange={handleImport} />
          </label>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        {/* We use a key to force remount when loading new data so FortuneSheet resets fully */}
        <Workbook key={JSON.stringify(data[0]?.name || 'new')} data={data} onChange={(d: any) => setData(d)} />
      </div>
    </div>
  );
};

export default SpreadsheetView;
