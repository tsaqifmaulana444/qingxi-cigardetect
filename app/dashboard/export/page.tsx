"use client";

import { useState } from "react";
import { MOCK_STUDENTS, categoryStyle } from "@/lib/data";

export default function ExportPage() {
  const [selected, setSelected] = useState<number[]>([]);
  const [exported, setExported] = useState(false);

  const allSelected = selected.length === MOCK_STUDENTS.length;
  const toggleAll   = () => setSelected(allSelected ? [] : MOCK_STUDENTS.map((s) => s.id));
  const toggleOne   = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  async function handleExport() {
    const rows = MOCK_STUDENTS.filter((s) => selected.includes(s.id));
    if (!rows.length) return;

    // Requires: npm install xlsx
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      ["No", "Nama", "NIS", "Kelas", "Nilai Sensor", "Kategori", "Terakhir Diuji"],
      ...rows.map((s, i) => [i + 1, s.name, s.nis, s.kelas, s.sensorValue, s.category, s.lastTested]),
    ]);
    ws["!cols"] = [{ wch: 4 }, { wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil ROTECH");
    XLSX.writeFile(wb, "rotech_export.xlsx");

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-green-900">Export Data</h1>
        <p className="text-sm text-green-600 mt-0.5">Pilih siswa untuk diekspor ke Excel (.xlsx)</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm text-green-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="accent-green-600 w-4 h-4"
          />
          Pilih semua ({MOCK_STUDENTS.length} siswa)
        </label>

        <button
          onClick={handleExport}
          disabled={selected.length === 0}
          className={`flex items-center gap-2 px-5 py-2 text-sm rounded-md font-medium transition-colors ${
            selected.length === 0
              ? "bg-green-100 text-green-300 cursor-not-allowed"
              : exported
              ? "bg-green-500 text-white"
              : "bg-green-700 text-white hover:bg-green-800"
          }`}
        >
          {exported
            ? "✓ Berhasil diekspor!"
            : `↓ Export${selected.length > 0 ? ` (${selected.length})` : ""} ke Excel`}
        </button>
      </div>

      <div className="bg-white border border-green-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-100">
              <th className="px-4 py-3 w-10"></th>
              {["Nama", "NIS", "Kelas", "Nilai Sensor", "Kategori", "Terakhir Diuji"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-green-700 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {MOCK_STUDENTS.map((s) => {
              const checked = selected.includes(s.id);
              return (
                <tr
                  key={s.id}
                  onClick={() => toggleOne(s.id)}
                  className={`cursor-pointer transition-colors ${checked ? "bg-green-50" : "hover:bg-green-50"}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-green-600 w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.nis}</td>
                  <td className="px-4 py-3 text-gray-600">{s.kelas}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.sensorValue}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryStyle(s.category)}`}>
                      {s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.lastTested}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.length > 0 && (
        <p className="mt-3 text-xs text-green-600">{selected.length} siswa dipilih</p>
      )}
    </div>
  );
}