"use client";

import { useState } from "react";
import type { SmokingCategory, Student, NewStudentForm } from "@/types/data";
import { MOCK_STUDENTS, categoryStyle, sensorBar, classifyCategory } from "@/lib/data";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<SmokingCategory | "Semua">("Semua");
  const [showModal, setShowModal] = useState(false);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.kelas.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" || s.category === filter;
    return matchSearch && matchFilter;
  });

  function handleAdd(newStudent: Student) {
    setStudents((prev) => [newStudent, ...prev]);
    setShowModal(false);
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-green-900">Data Siswa</h1>
          <p className="text-sm text-green-600 mt-0.5">{students.length} siswa terdaftar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-md hover:bg-green-800 transition-colors"
        >
          + Tambah Siswa
        </button>
      </div>

      {/* Filters */}
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
          {(["Semua", "Non Perokok", "Perokok Ringan", "Perokok Berat"] as const).map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Table */}
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
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-green-300 text-sm">
                  Tidak ada data ditemukan.
                </td>
              </tr>
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
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
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

      {/* Add Student Modal */}
      {showModal && (
        <AddStudentModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          nextId={students.length + 1}
        />
      )}
    </div>
  );
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

interface AddStudentModalProps {
  onAdd: (student: Student) => void;
  onClose: () => void;
  nextId: number;
}

const KELAS_OPTIONS = [
  "X IPA 1", "X IPA 2", "X IPS 1", "X IPS 2",
  "XI IPA 1", "XI IPA 2", "XI IPS 1", "XI IPS 2",
  "XII IPA 1", "XII IPA 2", "XII IPS 1", "XII IPS 2",
];

function AddStudentModal({ onAdd, onClose, nextId }: AddStudentModalProps) {
  const [form, setForm]     = useState<NewStudentForm>({ name: "", nis: "", kelas: KELAS_OPTIONS[0] });
  const [sensorValue, setSensorValue] = useState(0);
  const [errors, setErrors] = useState<Partial<NewStudentForm>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev: any) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate() {
    const errs: Partial<NewStudentForm> = {};
    if (!form.name.trim())  errs.name = "Nama wajib diisi.";
    if (!form.nis.trim())   errs.nis  = "NIS wajib diisi.";
    if (!/^\d+$/.test(form.nis)) errs.nis = "NIS hanya boleh angka.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const category = classifyCategory(sensorValue);

    onAdd({
      id: nextId,
      name: form.name.trim(),
      nis: form.nis.trim(),
      kelas: form.kelas,
      sensorValue,
      category,
      lastTested: today,
    });
  }

  const previewCategory = classifyCategory(sensorValue);
  const previewStyle    = categoryStyle(previewCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-green-100 shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-100">
          <h2 className="text-base font-semibold text-green-900">Tambah Siswa Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-green-800 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Andi Saputra"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-800 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                errors.name ? "border-red-300" : "border-green-200"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* NIS */}
          <div>
            <label className="block text-xs font-medium text-green-800 mb-1.5">NIS</label>
            <input
              type="text"
              name="nis"
              value={form.nis}
              onChange={handleChange}
              placeholder="Contoh: 2024009"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-800 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                errors.nis ? "border-red-300" : "border-green-200"
              }`}
            />
            {errors.nis && <p className="text-xs text-red-500 mt-1">{errors.nis}</p>}
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-medium text-green-800 mb-1.5">Kelas</label>
            <select
              name="kelas"
              value={form.kelas}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {KELAS_OPTIONS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}