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

  return (
    <div className="w-full h-full flex flex-col bg-[#09090b] rounded-lg border border-[#27272a] overflow-hidden">
      <div className="h-12 border-b border-[#27272a] bg-[#0a0a0c] flex items-center px-4 justify-between flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-200">Financial Modeling</h2>
        <div>
          <label className="cursor-pointer px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium rounded-lg transition-colors">
            Import Excel (.xlsx)
            <input type="file" className="hidden" accept=".xlsx" onChange={handleImport} />
          </label>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        <Workbook data={data} />
      </div>
    </div>
  );
};

export default SpreadsheetView;
