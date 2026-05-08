"use client";

import { useEffect, useState } from "react";
import { categoryStyle, sensorBar } from "@/lib/data";
import type { SmokingCategory } from "@/types/data";
import TestModal from "@/components/TestModal";

type Student = {
  id: number;
  name: string;
  kelas: string;
  nilai_sensor: number;
  category: SmokingCategory;
  waktu: string;
};

type ApiTest = {
  id: number;
  id_siswa: number;
  nama: string;
  kelas: string;
  nilai_sensor: number;
  kategori: string;
  waktu_pengujian: string;
};

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:3001/api/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiTest[] = await res.json();

      const mapped: Student[] = data.map((item) => ({
        id: item.id,
        name: item.nama,
        kelas: item.kelas,
        nilai_sensor: Number(item.nilai_sensor) || 0,
        category: item.kategori as SmokingCategory,
        waktu: item.waktu_pengujian,
      }));

      setStudents(mapped);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }

  const nonPerokok = students.filter((s) => s.category === "Normal").length;
  const ringan = students.filter((s) => s.category === "Buruk").length;
  const berat = students.filter((s) => s.category === "Sangat Buruk").length;

  const avgSensor =
    students.length > 0
      ? Math.round(
          students.reduce((a, s) => a + Number(s.nilai_sensor || 0), 0) /
            students.length
        )
      : 0;

  if (loading) {
    return (
      <div className="p-6 text-sm text-green-700">Memuat dashboard...</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-green-900">Dashboard</h1>
          <p className="text-sm text-green-600 mt-0.5">
            Ringkasan hasil pengujian ROTECT
          </p>
        </div>

        {/* Tombol buka modal */}
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tes Baru
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Siswa Diuji",
            value: students.length,
            sub: "semua kelas",
          },
          {
            label: "Non Perokok",
            value: nonPerokok,
            sub: "sensor < 200",
          },
          {
            label: "Perokok Ringan",
            value: ringan,
            sub: "sensor 200–500",
          },
          {
            label: "Perokok Berat",
            value: berat,
            sub: "sensor > 500",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white border border-green-100 rounded-lg p-4"
          >
            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">
              {c.label}
            </p>
            <p className="text-3xl font-semibold text-green-900">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-white border border-green-100 rounded-lg p-5 mb-5">
        <h2 className="text-sm font-medium text-green-800 mb-3">
          Klasifikasi Sensor MQ-2
        </h2>

        <div className="flex gap-6 items-center">
          {[
            { label: "Non Perokok", range: "< 200", color: "bg-green-500" },
            { label: "Perokok Ringan", range: "200–500", color: "bg-yellow-400" },
            { label: "Perokok Berat", range: "> 500", color: "bg-red-500" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${t.color}`} />
              <span className="text-sm text-gray-700">{t.label}</span>
              <span className="text-xs text-gray-400">({t.range})</span>
            </div>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">Rata-rata sensor:</span>
            <span className="text-sm font-medium text-green-800">
              {avgSensor}
            </span>
          </div>
        </div>
      </div>

      {/* Recent tests */}
      <div className="bg-white border border-green-100 rounded-lg p-5">
        <h2 className="text-sm font-medium text-green-800 mb-3">
          Pengujian Terbaru
        </h2>

        <ul className="divide-y divide-green-50">
          {students.slice(0, 5).map((s) => {
            const { pct, color } = sensorBar(s.nilai_sensor);

            return (
              <li key={s.id} className="flex items-center gap-4 py-3">
                <div className="w-36 shrink-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-400">{s.kelas}</p>
                </div>

                <div className="flex-1">
                  <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <span className="text-xs font-mono text-gray-500 w-10 text-right">
                  {s.nilai_sensor}
                </span>

                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium w-32 text-center ${categoryStyle(
                    s.category
                  )}`}
                >
                  {s.category}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal */}
      <TestModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => fetchStudents()}
      />
    </div>
  );
}
