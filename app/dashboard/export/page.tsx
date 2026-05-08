"use client";

import { useEffect, useState, useMemo } from "react";
import { categoryStyle } from "@/lib/data";
import type { SmokingCategory } from "@/types/data";

type TestResult = {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  nilai_sensor: number;
  kategori: SmokingCategory;
  waktu_pengujian: string;
};

type SortField =
  | "nama"
  | "nis"
  | "kelas"
  | "nilai_sensor"
  | "kategori"
  | "waktu_pengujian";
type SortDir = "asc" | "desc";

export default function ExportPage() {
  const [students, setStudents] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<number[]>([]);
  const [exported, setExported] = useState(false);

  // --- Filter & Sort state ---
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [sortField, setSortField] = useState<SortField>("waktu_pengujian");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:3001/api/test", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: TestResult[] = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }

  const kelasList = useMemo(
    () => [...new Set(students.map((s) => s.kelas))].sort(),
    [students]
  );
  const kategoriList = useMemo(
    () => [...new Set(students.map((s) => s.kategori))].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    let data = [...students];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q)
      );
    }

    if (filterKelas) data = data.filter((s) => s.kelas === filterKelas);

    if (filterKategori)
      data = data.filter((s) => s.kategori === filterKategori);

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      data = data.filter(
        (s) => new Date(s.waktu_pengujian).getTime() >= from
      );
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // inclusive
      data = data.filter(
        (s) => new Date(s.waktu_pengujian).getTime() <= to
      );
    }

    // Sort
    data.sort((a, b) => {
      let va: string | number = a[sortField];
      let vb: string | number = b[sortField];

      if (sortField === "waktu_pengujian") {
        va = new Date(va as string).getTime();
        vb = new Date(vb as string).getTime();
      } else if (typeof va === "string") {
        va = va.toLowerCase();
        vb = (vb as string).toLowerCase();
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [
    students,
    search,
    filterKelas,
    filterKategori,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
  ]);

  const allSelected =
    filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () =>
    setSelected(allSelected ? [] : filtered.map((s) => s.id));

  const toggleOne = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function resetFilters() {
    setSearch("");
    setFilterKelas("");
    setFilterKategori("");
    setDateFrom("");
    setDateTo("");
    setSortField("waktu_pengujian");
    setSortDir("desc");
  }

  async function handleExport() {
    const rows = filtered.filter((s) => selected.includes(s.id));
    if (!rows.length) return;

    const XLSX = await import("xlsx");

    const ws = XLSX.utils.aoa_to_sheet([
      [
        "No",
        "Nama",
        "NIS",
        "Kelas",
        "Nilai Sensor",
        "Kategori",
        "Waktu Pengujian",
      ],
      ...rows.map((s, i) => [
        i + 1,
        s.nama,
        s.nis,
        s.kelas,
        s.nilai_sensor,
        s.kategori,
        new Date(s.waktu_pengujian).toLocaleDateString("id-ID"),
      ]),
    ]);

    ws["!cols"] = [
      { wch: 4 },
      { wch: 24 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil ROTECH");
    XLSX.writeFile(wb, "rotech_export.xlsx");

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <span className="ml-1 text-green-300">↕</span>;
    return (
      <span className="ml-1 text-green-700">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-green-700">Memuat data export...</div>
    );
  }

  const hasActiveFilters =
    search || filterKelas || filterKategori || dateFrom || dateTo;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-green-900">Export Data</h1>
        <p className="text-sm text-green-600 mt-0.5">
          Pilih siswa untuk diekspor ke Excel
        </p>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            Filter &amp; Urutan
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-green-500 hover:text-green-700 underline"
            >
              Reset semua
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-green-600 font-medium">
              Cari Nama / NIS
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama atau NIS…"
              className="px-3 py-1.5 text-sm border border-green-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 placeholder-green-200"
            />
          </div>

          {/* Kelas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-green-600 font-medium">Kelas</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-3 py-1.5 text-sm border border-green-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700"
            >
              <option value="">Semua kelas</option>
              {kelasList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-green-600 font-medium">
              Kategori
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-3 py-1.5 text-sm border border-green-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700"
            >
              <option value="">Semua kategori</option>
              {kategoriList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-green-600 font-medium">
              Tanggal dari
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-sm border border-green-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-green-600 font-medium">
              Tanggal sampai
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-sm border border-green-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700"
            />
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-green-600 font-medium">
              Urutkan berdasarkan
            </label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="flex-1 px-3 py-1.5 text-sm border border-green-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700"
              >
                <option value="nama">Nama</option>
                <option value="nis">NIS</option>
                <option value="kelas">Kelas</option>
                <option value="nilai_sensor">Nilai Sensor</option>
                <option value="kategori">Kategori</option>
                <option value="waktu_pengujian">Waktu Pengujian</option>
              </select>
              <button
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                title={sortDir === "asc" ? "Ascending" : "Descending"}
                className="px-3 py-1.5 border border-green-200 rounded-md bg-white text-green-700 hover:bg-green-100 text-sm"
              >
                {sortDir === "asc" ? "↑ A–Z" : "↓ Z–A"}
              </button>
            </div>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-green-500">
          Menampilkan {filtered.length} dari {students.length} data
        </p>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm text-green-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="accent-green-600 w-4 h-4"
          />
          Pilih semua ({filtered.length} data)
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

      {/* Table */}
      <div className="bg-white border border-green-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-100">
              <th className="px-4 py-3 w-10"></th>
              {(
                [
                  ["Nama", "nama"],
                  ["NIS", "nis"],
                  ["Kelas", "kelas"],
                  ["Nilai Sensor", "nilai_sensor"],
                  ["Kategori", "kategori"],
                  ["Waktu Pengujian", "waktu_pengujian"],
                ] as [string, SortField][]
              ).map(([label, field]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="text-left px-4 py-3 text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:text-green-900 select-none"
                >
                  {label}
                  <SortIcon field={field} />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-green-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-green-300 text-sm"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const checked = selected.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    onClick={() => toggleOne(s.id)}
                    className={`cursor-pointer transition-colors ${
                      checked ? "bg-green-50" : "hover:bg-green-50"
                    }`}
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
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.nama}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {s.nis}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.kelas}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {s.nilai_sensor}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryStyle(
                          s.kategori
                        )}`}
                      >
                        {s.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(s.waktu_pengujian).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selected.length > 0 && (
        <p className="mt-3 text-xs text-green-600">
          {selected.length} data dipilih
        </p>
      )}
    </div>
  );
}
