"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { callAdminAction } from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

type ReportRow = Record<string, string | number>;

const REPORT_TYPES = [
  { value: "sales", label: "Sales Report" },
  { value: "products", label: "Product Sales Report" },
  { value: "customers", label: "New Customer Report" },
  { value: "inventory", label: "Inventory Report" },
];

function toCsv(rows: ReportRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  });
  return lines.join("\n");
}

export default function AdminReportsPage() {
  const [type, setType] = useState("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);

  async function runReport() {
    setLoading(true);
    const result = await callAdminAction<{ rows: ReportRow[]; summary: Record<string, number> }>("getReport", { type, from, to });
    setLoading(false);
    if (result.success && result.data) {
      setRows(result.data.rows);
      setSummary(result.data.summary);
    }
  }

  function downloadCsv() {
    if (!rows) return;
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kartme-${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="font-heading font-semibold text-2xl mb-4">Reports</h1>

      <div className="bg-white border border-km-line rounded-xl p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-km-muted block mb-1">Report Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-km-line rounded-lg px-3 py-2 text-sm">
            {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-km-muted block mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-km-muted block mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-km-line rounded-lg px-3 py-2 text-sm" />
        </div>
        <Button onClick={runReport} loading={loading}>Run Report</Button>
        {rows && rows.length > 0 && (
          <Button variant="outline" onClick={downloadCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      {summary && (
        <div className="flex flex-wrap gap-4 mb-4">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="bg-white border border-km-line rounded-xl px-4 py-3">
              <p className="text-xs text-km-muted capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className="font-heading font-semibold text-lg tabular-nums">
                {key.toLowerCase().includes("sales") || key.toLowerCase().includes("revenue") ? formatPrice(value) : value}
              </p>
            </div>
          ))}
        </div>
      )}

      {rows && (
        <div className="bg-white border border-km-line rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-km-muted border-b border-km-line">
                {rows[0] && Object.keys(rows[0]).map((h) => <th key={h} className="py-2 px-4 capitalize">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-km-line last:border-0">
                  {Object.values(row).map((v, j) => <td key={j} className="py-2 px-4">{String(v)}</td>)}
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="py-8 text-center text-km-muted">No data for this range</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
