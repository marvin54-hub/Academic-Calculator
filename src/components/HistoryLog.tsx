import { useState } from "react";
import { Search, Trash2, Calendar, FileSpreadsheet, FileText, CheckCircle, ChevronRight, Calculator } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HistoryEntry } from "../types";

interface HistoryLogProps {
  history: HistoryEntry[];
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
  themeColor: string;
}

export default function HistoryLog({ history, onDeleteEntry, onClearHistory, themeColor }: HistoryLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredHistory = history.filter(
    (h) =>
      h.calculatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.result.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summarizeInputs = (inputs: Record<string, string | number>) =>
    Object.entries(inputs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

  const exportCsv = () => {
    const headers = ["Date", "Time", "Calculator", "Inputs", "Result"];
    const rows = history.map((h) => [
      h.date,
      h.time,
      h.calculatorName,
      summarizeInputs(h.inputs).replace(/,/g, ";"),
      h.result.replace(/,/g, ";"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `academic_calculator_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Academic Calculator - Calculation History", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Date", "Time", "Calculator", "Inputs", "Result"]],
      body: history.map((h) => [h.date, h.time, h.calculatorName, summarizeInputs(h.inputs), h.result]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 3: { cellWidth: 60 } },
    });

    doc.save(`academic_calculator_history_${Date.now()}.pdf`);
  };

  const triggerExport = (format: "csv" | "pdf") => {
    if (history.length === 0) return;

    setSuccessMsg(`Exporting calculation history as ${format.toUpperCase()}...`);

    try {
      if (format === "csv") {
        exportCsv();
      } else {
        exportPdf();
      }
      setSuccessMsg(`Calculation report downloaded successfully in ${format.toUpperCase()} format!`);
    } catch (err) {
      console.error(err);
      setSuccessMsg(null);
      alert("Something went wrong generating the export. Please try again.");
      return;
    }
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Export & Actions Row */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search previous calculations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-200 focus:bg-slate-50/20 transition shadow-xs"
          />
        </div>

        <div className="flex space-x-2 shrink-0">
          <button
            onClick={() => triggerExport("csv")}
            disabled={history.length === 0}
            className="flex-1 py-3 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center space-x-1.5 transition active:scale-[0.98] disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => triggerExport("pdf")}
            disabled={history.length === 0}
            className="flex-1 py-3 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center space-x-1.5 transition active:scale-[0.98] disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="py-3 px-4 bg-white dark:bg-slate-900 hover:bg-red-50 border border-slate-100 dark:border-slate-800 hover:border-red-100 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-2xl flex items-center justify-center transition active:scale-[0.98] disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 text-center font-medium flex items-center justify-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* History Items Log */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.2rem] text-center space-y-3 shadow-xs">
          <Trash2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-slate-800 dark:text-slate-100 font-serif font-bold italic text-sm">No History Logged</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
            Calculations performed inside the "Calculate" section will automatically log here for you to search or export.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((h) => (
            <div
              key={h.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.2rem] p-5 space-y-3 shadow-xs hover:border-slate-200/80 transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <Calculator className="w-4 h-4" style={{ color: themeColor }} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-850 text-sm leading-tight">{h.calculatorName}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {h.date} at {h.time}
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteEntry(h.id)}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Inputs Tag Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(h.inputs).map(([key, val]) => (
                  <span
                    key={key}
                    className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-800 uppercase"
                  >
                    {key}: <span className="text-slate-800 dark:text-slate-100">{val}</span>
                  </span>
                ))}
              </div>

              {/* Result display */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Calculation Output</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {h.result}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
