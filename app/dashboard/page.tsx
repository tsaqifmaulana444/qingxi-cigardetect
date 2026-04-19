"use client";

import { MOCK_STUDENTS, categoryStyle, sensorBar } from "@/lib/data";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";
import type { Student } from "@/types/data";

export default function DashboardPage() {
  const nonPerokok = MOCK_STUDENTS.filter((s: { category: any; }) => s.category === "Non Perokok").length;
  const ringan     = MOCK_STUDENTS.filter((s: { category: any; }) => s.category === "Perokok Ringan").length;
  const berat      = MOCK_STUDENTS.filter((s: { category: any; }) => s.category === "Perokok Berat").length;
  const avgSensor  = Math.round(
    MOCK_STUDENTS.reduce((a: any, s: { sensorValue: any; }) => a + s.sensorValue, 0) / MOCK_STUDENTS.length
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-green-900">Dashboard</h1>
        <p className="text-sm text-green-600 mt-0.5">Ringkasan hasil pengujian ROTECH</p>
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

      {/* Legend */}
      <div className="bg-white border border-green-100 rounded-lg p-5 mb-5">
        <h2 className="text-sm font-medium text-green-800 mb-3">Klasifikasi Sensor MQ-2</h2>
        <div className="flex gap-6 items-center">
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
            <span className="text-xs text-gray-400">Rata-rata sensor:</span>
            <span className="text-sm font-medium text-green-800">{avgSensor}</span>
          </div>
        </div>
      </div>

      {/* Recent tests */}
      <div className="bg-white border border-green-100 rounded-lg p-5">
        <h2 className="text-sm font-medium text-green-800 mb-3">Pengujian Terbaru</h2>
        <ul className="divide-y divide-green-50">
          {MOCK_STUDENTS.slice(0, 5).map((s: Student) => {
            const { pct, color } = sensorBar(s.sensorValue);
            return (
              <li key={s.id} className="flex items-center gap-4 py-3">
                <div className="w-36 shrink-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.kelas}</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
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