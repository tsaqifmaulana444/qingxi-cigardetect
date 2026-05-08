"use client";

import { useEffect, useState } from "react";

type Student = {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  created_at: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:3001/api/students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log(data);

      setStudents(data);
    } catch (error) {
      console.error("Gagal mengambil data siswa:", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter((s) => {
    return (
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase()) ||
      s.kelas.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-6 text-sm text-green-700">
        Memuat data siswa...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-green-900">
          Data Siswa
        </h1>

        <p className="text-sm text-green-600 mt-0.5">
          {students.length} siswa terdaftar
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama, NIS, atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 text-sm border border-green-200 rounded-md bg-white text-gray-800 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-green-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-100">
              {[
                "Nama",
                "NIS",
                "Kelas",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-green-700 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-green-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-green-300 text-sm"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.nama}
                  </td>

                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {s.nis}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {s.kelas}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}