import type { SmokingCategory, Student } from "@/types/data";

export function categoryStyle(cat: SmokingCategory) {
  if (cat === "AMAN")    return "bg-green-100 text-green-700";
  if (cat === "WASPADA") return "bg-yellow-100 text-yellow-700";
  if (cat === "BAHAYA") return "bg-red-100 text-red-700";
  return "bg-red-100 text-red-700";
}

export function sensorBar(value: number) {
  const pct   = Math.min((value / 800) * 100, 100);
  const color = value < 200 ? "bg-green-500" : value <= 500 ? "bg-yellow-400" : "bg-red-500";
  return { pct, color };
}

export function classifyCategory(value: number): SmokingCategory {
  if (value < 200)  return "AMAN";
  if (value <= 500) return "WASPADA";
  return "BAHAYA";
}