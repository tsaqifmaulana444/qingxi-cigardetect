"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SmokingCategory = "Non Perokok" | "Perokok Ringan" | "Perokok Berat";

interface Student {
  id: number;
  name: string;
  nis: string;
  kelas: string;
  lastTested: string;
  sensorValue: number;
  category: SmokingCategory;
}

type Page = "dashboard" | "students" | "export";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STUDENTS: Student[] = [
  { id: 1, name: "Andi Saputra",      nis: "2024001", kelas: "XI IPA 1", lastTested: "Apr 18, 2026", sensorValue: 85,  category: "Non Perokok"    },
  { id: 2, name: "Budi Hartono",      nis: "2024002", kelas: "XI IPA 2", lastTested: "Apr 18, 2026", sensorValue: 320, category: "Perokok Ringan" },
  { id: 3, name: "Citra Dewi",        nis: "2024003", kelas: "X IPS 1",  lastTested: "Apr 17, 2026", sensorValue: 60,  category: "Non Perokok"    },
  { id: 4, name: "Dimas Pratama",     nis: "2024004", kelas: "XII IPA 1",lastTested: "Apr 17, 2026", sensorValue: 610, category: "Perokok Berat"  },
  { id: 5, name: "Eka Rahmawati",     nis: "2024005", kelas: "X IPA 2",  lastTested: "Apr 16, 2026", sensorValue: 145, category: "Non Perokok"    },
  { id: 6, name: "Fajar Nugroho",     nis: "2024006", kelas: "XI IPS 2", lastTested: "Apr 16, 2026", sensorValue: 450, category: "Perokok Ringan" },
  { id: 7, name: "Gita Permatasari",  nis: "2024007", kelas: "XII IPS 1",lastTested: "Apr 15, 2026", sensorValue: 40,  category: "Non Perokok"    },
  { id: 8, name: "Hendra Kusuma",     nis: "2024008", kelas: "X IPA 1",  lastTested: "Apr 15, 2026", sensorValue: 780, category: "Perokok Berat"  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function categoryStyle(cat: SmokingCategory) {
  if (cat === "Non Perokok")    return "bg-green-100 text-green-700";
  if (cat === "Perokok Ringan") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function sensorBar(value: number) {
  const pct = Math.min((value / 800) * 100, 100);
  const color = value < 200 ? "bg-green-500" : value <= 500 ? "bg-yellow-400" : "bg-red-500";
  return { pct, color };
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: { label: string; page: Page; icon: string }[] = [
  { label: "Dashboard", page: "dashboard", icon: "▦" },
  { label: "Siswa",     page: "students",  icon: "◉" },
  { label: "Export",    page: "export",    icon: "↓"  },
];

// ─── Dashboard page ───────────────────────────────────────────────────────────

function DashboardPage() {
  const nonPerokok    = MOCK_STUDENTS.filter((s) => s.category === "Non Perokok").length;
  const ringan        = MOCK_STUDENTS.filter((s) => s.category === "Perokok Ringan").length;
  const berat         = MOCK_STUDENTS.filter((s) => s.category === "Perokok Berat").length;
  const avgSensor     = Math.round(MOCK_STUDENTS.reduce((a, s) => a + s.sensorValue, 0) / MOCK_STUDENTS.length);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-green-900">Dashboard ROTECH</h1>
        <p className="text-sm text-green-600 mt-0.5">Analyzer Napas Perokok — Sensor MQ-2</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Siswa Diuji", value: MOCK_STUDENTS.length, sub: "semua kelas" },
          { label: "Non Perokok",       value: nonPerokok,           sub: "sensor < 200" },
          { label: "Perokok Ringan",    value: ringan,               sub: "sensor 200–500" },
          { label: "Perokok Berat",     value: berat,                sub: "sensor > 500" },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-green-100 rounded-lg p-4">
            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-3xl font-semibold text-green-900">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Sensor threshold legend */}
      <div className="bg-white border border-green-100 rounded-lg p-5 mb-5">
        <h2 className="text-sm font-medium text-green-800 mb-3">Klasifikasi Nilai Sensor MQ-2</h2>
        <div className="flex gap-6">
          {[
            { label: "Non Perokok",    range: "< 200",   color: "bg-green-500" },
            { label: "Perokok Ringan", range: "200–500", color: "bg-yellow-400" },
            { label: "Perokok Berat",  range: "> 500",   color: "bg-red-500" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${t.color}`}></div>
              <span className="text-sm text-gray-700">{t.label}</span>
              <span className="text-xs text-gray-400">({t.range})</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">Rata-rata sensor hari ini:</span>
            <span className="text-sm font-medium text-green-800">{avgSensor}</span>
          </div>
        </div>
      </div>

      {/* Recent tests */}
      <div className="bg-white border border-green-100 rounded-lg p-5">
        <h2 className="text-sm font-medium text-green-800 mb-3">Pengujian Terbaru</h2>
        <ul className="divide-y divide-green-50">
          {MOCK_STUDENTS.slice(0, 5).map((s) => {
            const { pct, color } = sensorBar(s.sensorValue);
            return (
              <li key={s.id} className="flex items-center gap-4 py-3">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.kelas}</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-500 w-10 text-right">{s.sensorValue}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium w-32 text-center ${categoryStyle(s.category)}`}>
                  {s.category}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─── Students page ────────────────────────────────────────────────────────────

function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SmokingCategory | "Semua">("Semua");

  const filtered = MOCK_STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.kelas.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" || s.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-green-900">Data Siswa</h1>
          <p className="text-sm text-green-600 mt-0.5">{MOCK_STUDENTS.length} siswa terdaftar</p>
        </div>
        <button className="px-4 py-2 bg-green-700 text-white text-sm rounded-md hover:bg-green-800 transition-colors">
          + Tambah Siswa
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama, NIS, atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 text-sm border border-green-200 rounded-md bg-white text-gray-800 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as SmokingCategory | "Semua")}
          className="px-3 py-2 text-sm border border-green-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {["Semua", "Non Perokok", "Perokok Ringan", "Perokok Berat"].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-green-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-100">
              {["Nama", "NIS", "Kelas", "Nilai Sensor", "Kategori", "Terakhir Diuji"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-green-700 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-green-300 text-sm">Tidak ada data ditemukan.</td></tr>
            ) : filtered.map((s) => {
              const { pct, color } = sensorBar(s.sensorValue);
              return (
                <tr key={s.id} className="hover:bg-green-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.nis}</td>
                  <td className="px-4 py-3 text-gray-600">{s.kelas}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-green-50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-xs font-mono text-gray-500">{s.sensorValue}</span>
                    </div>
                  </td>
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
    </div>
  );
}

// ─── Export page ──────────────────────────────────────────────────────────────

function ExportPage() {
  const [selected, setSelected] = useState<number[]>([]);
  const [exported, setExported] = useState(false);

  const allSelected = selected.length === MOCK_STUDENTS.length;
  const toggleAll   = () => setSelected(allSelected ? [] : MOCK_STUDENTS.map((s) => s.id));
  const toggleOne   = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  async function handleExport() {
    const rows = MOCK_STUDENTS.filter((s) => selected.includes(s.id));
    if (!rows.length) return;
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
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-green-600 w-4 h-4" />
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
          {exported ? "✓ Berhasil diekspor!" : `↓ Export${selected.length > 0 ? ` (${selected.length})` : ""} ke Excel`}
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

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  return (
    <div className="flex h-screen bg-green-50 font-sans">
      <aside className="w-56 shrink-0 bg-green-700 flex flex-col">
        <div className="px-5 py-4 border-b border-green-600">
          <p className="text-base font-semibold text-white tracking-tight">ROTECH</p>
          <p className="text-xs text-green-300 mt-0.5">Smoke Breath Analyzer</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              onClick={() => setActivePage(item.page)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                activePage === item.page
                  ? "bg-white text-green-700 font-medium"
                  : "text-green-100 hover:bg-green-600 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-green-600">
          <p className="text-xs text-green-300">Universitas Bengkulu</p>
          <p className="text-xs text-green-400 mt-0.5">Instrumentasi Medis — 2026</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto px-8 py-8">
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "students"  && <StudentsPage />}
        {activePage === "export"    && <ExportPage />}
      </main>
    </div>
  );
}