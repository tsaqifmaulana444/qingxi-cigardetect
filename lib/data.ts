import type { SmokingCategory, Student } from "@/types/data";

export const MOCK_STUDENTS: Student[] = [
  { id: 1, name: "Andi Saputra",     nis: "2024001", kelas: "XI IPA 1",  lastTested: "Apr 18, 2026", sensorValue: 85,  category: "Non Perokok"    },
  { id: 2, name: "Budi Hartono",     nis: "2024002", kelas: "XI IPA 2",  lastTested: "Apr 18, 2026", sensorValue: 320, category: "Perokok Ringan" },
  { id: 3, name: "Citra Dewi",       nis: "2024003", kelas: "X IPS 1",   lastTested: "Apr 17, 2026", sensorValue: 60,  category: "Non Perokok"    },
  { id: 4, name: "Dimas Pratama",    nis: "2024004", kelas: "XII IPA 1", lastTested: "Apr 17, 2026", sensorValue: 610, category: "Perokok Berat"  },
  { id: 5, name: "Eka Rahmawati",    nis: "2024005", kelas: "X IPA 2",   lastTested: "Apr 16, 2026", sensorValue: 145, category: "Non Perokok"    },
  { id: 6, name: "Fajar Nugroho",    nis: "2024006", kelas: "XI IPS 2",  lastTested: "Apr 16, 2026", sensorValue: 450, category: "Perokok Ringan" },
  { id: 7, name: "Gita Permatasari", nis: "2024007", kelas: "XII IPS 1", lastTested: "Apr 15, 2026", sensorValue: 40,  category: "Non Perokok"    },
  { id: 8, name: "Hendra Kusuma",    nis: "2024008", kelas: "X IPA 1",   lastTested: "Apr 15, 2026", sensorValue: 780, category: "Perokok Berat"  },
];

export function categoryStyle(cat: SmokingCategory) {
  if (cat === "Non Perokok")    return "bg-green-100 text-green-700";
  if (cat === "Perokok Ringan") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export function sensorBar(value: number) {
  const pct   = Math.min((value / 800) * 100, 100);
  const color = value < 200 ? "bg-green-500" : value <= 500 ? "bg-yellow-400" : "bg-red-500";
  return { pct, color };
}

export function classifyCategory(value: number): SmokingCategory {
  if (value < 200)  return "Non Perokok";
  if (value <= 500) return "Perokok Ringan";
  return "Perokok Berat";
}