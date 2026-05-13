"use client";

import { useState, useEffect, useRef } from "react";

// ─── Ganti dengan IP ESP32 kamu ────────────────────────────────────────────
const ESP32_IP = "192.168.1.100";
const ESP32_URL = `http://${ESP32_IP}/sensor`;
const POLL_INTERVAL_MS = 1500;
// ───────────────────────────────────────────────────────────────────────────

type Step = "form" | "scanning" | "confirm" | "success" | "error";

type SensorResult = {
  nilai_sensor: number;
  kategori: string;
};

type ApiStudent = {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const categoryColor: Record<string, string> = {
  AMAN: "bg-emerald-100 text-emerald-700 border-emerald-200",
  WASPADA: "bg-yellow-100 text-yellow-700 border-yellow-200",
  BAHAYA: "bg-red-100 text-red-700 border-red-200",
};

export default function TestModal({ open, onClose, onSuccess }: Props) {
  // ── Student list
  const [studentList, setStudentList] = useState<ApiStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Searchable dropdown
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Flow state
  const [step, setStep] = useState<Step>("form");
  const [formError, setFormError] = useState("");
  const [sensorResult, setSensorResult] = useState<SensorResult | null>(null);
  const [postError, setPostError] = useState("");
  const [posting, setPosting] = useState(false);

  // ── Polling
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const MAX_POLL = 40;

  // Fetch students when modal opens
  useEffect(() => {
    if (open) fetchStudents();
  }, [open]);

  // Reset all state when modal closes
  useEffect(() => {
    if (!open) {
      stopPolling();
      setStep("form");
      setQuery("");
      setSelectedStudent(null);
      setDropdownOpen(false);
      setFormError("");
      setSensorResult(null);
      setPostError("");
      setPosting(false);
      pollCountRef.current = 0;
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchStudents() {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:3001/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiStudent[] = await res.json();
      setStudentList(data);
    } catch {
      console.error("Gagal mengambil data siswa");
    } finally {
      setLoadingStudents(false);
    }
  }

  const filtered = studentList.filter(
    (s) =>
      s.nama.toLowerCase().includes(query.toLowerCase()) ||
      s.nis.toLowerCase().includes(query.toLowerCase()) ||
      s.kelas.toLowerCase().includes(query.toLowerCase())
  );

  function selectStudent(s: ApiStudent) {
    setSelectedStudent(s);
    setQuery(s.nama);
    setDropdownOpen(false);
    setFormError("");
  }

  function clearStudent() {
    setSelectedStudent(null);
    setQuery("");
    setDropdownOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // ── Step 1: start scan
  function handleStartScan() {
    if (!selectedStudent) return setFormError("Pilih siswa terlebih dahulu.");
    setFormError("");
    setStep("scanning");
    startPolling();
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > MAX_POLL) {
        stopPolling();
        setStep("error");
        setPostError("Timeout: ESP32 tidak merespons dalam 60 detik.");
        return;
      }

      try {
        const res = await fetch(ESP32_URL, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return;
        const json = await res.json();
        const nilai: number = json.nilai_sensor ?? json.value ?? json.sensor;
        if (nilai !== undefined && nilai !== null) {
          stopPolling();
          setSensorResult({nilai_sensor: nilai, kategori: json.kategori});
          setStep("confirm");
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL_MS);
  }

  // ── Step 3: POST ke API
  async function handleConfirm() {
    if (!sensorResult || !selectedStudent) return;
    setPosting(true);
    setPostError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:3001/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_siswa: selectedStudent.id,
          nama: selectedStudent.nama,
          nis: selectedStudent.nis,
          kelas: selectedStudent.kelas,
          nilai_sensor: sensorResult.nilai_sensor,
          kategori: sensorResult.kategori,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setStep("success");
      onSuccess?.();
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setPosting(false);
    }
  }

  function handleCancel() {
    stopPolling();
    setStep("form");
    setSensorResult(null);
    pollCountRef.current = 0;
  }

  function handleTestNext() {
    setStep("form");
    setQuery("");
    setSelectedStudent(null);
    setSensorResult(null);
    pollCountRef.current = 0;
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={() => { if (step !== "scanning") onClose(); }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden h-[60vh]">

          {/* Top bar */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">
                Tes Sensor Baru
              </h2>
              <p className="text-green-200 text-xs mt-0.5">
                {step === "form" && "Pilih siswa yang akan diuji"}
                {step === "scanning" && "Menunggu data dari ESP32…"}
                {step === "confirm" && "Periksa hasil sebelum menyimpan"}
                {step === "success" && "Data berhasil disimpan"}
                {step === "error" && "Terjadi kesalahan"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["form", "scanning", "confirm"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === s
                      ? "bg-white scale-125"
                      : (step === "confirm" && i < 2) || (step === "scanning" && i < 1)
                      ? "bg-green-400"
                      : "bg-green-500/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">

            {/* ── STEP: FORM ── */}
            {step === "form" && (
              <div className="space-y-4">

                {/* Searchable dropdown */}
                <div className="flex flex-col gap-1" ref={dropdownRef}>
                  <label className="text-xs font-medium text-green-700">
                    Cari Siswa <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${
                      dropdownOpen
                        ? "border-green-400 ring-2 ring-green-100"
                        : "border-green-200"
                    } ${selectedStudent ? "bg-green-50" : "bg-white"}`}>
                      {/* Search icon */}
                      <svg
                        className="w-4 h-4 text-green-400 ml-3 shrink-0"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>

                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setSelectedStudent(null);
                          setDropdownOpen(true);
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        placeholder={
                          loadingStudents
                            ? "Memuat data siswa…"
                            : "Ketik nama, NIS, atau kelas…"
                        }
                        disabled={loadingStudents}
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none placeholder-gray-300 text-gray-800"
                      />

                      {/* Clear button */}
                      {(query || selectedStudent) && (
                        <button
                          onClick={clearStudent}
                          className="mr-3 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Dropdown list */}
                    {dropdownOpen && !loadingStudents && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-green-100 rounded-xl shadow-lg overflow-hidden">
                        {filtered.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-400 text-center">
                            Siswa tidak ditemukan
                          </p>
                        ) : (
                          <ul className="max-h-52 overflow-y-auto divide-y divide-green-50">
                            {filtered.map((s) => (
                              <li
                                key={s.id}
                                onMouseDown={(e) => e.preventDefault()} // prevent input blur
                                onClick={() => selectStudent(s)}
                                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-green-50 transition-colors ${
                                  selectedStudent?.id === s.id ? "bg-green-50" : ""
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{s.nama}</p>
                                  <p className="text-xs text-gray-400 font-mono">{s.nis}</p>
                                </div>
                                <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md font-medium shrink-0 ml-2">
                                  {s.kelas}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-fill read-only fields */}
                {selectedStudent && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-green-700">NIS</label>
                      <div className="px-3 py-2 text-sm border border-green-100 rounded-lg bg-gray-50 text-gray-500 font-mono select-none">
                        {selectedStudent.nis}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-green-700">Kelas</label>
                      <div className="px-3 py-2 text-sm border border-green-100 rounded-lg bg-gray-50 text-gray-500 select-none">
                        {selectedStudent.kelas}
                      </div>
                    </div>
                  </div>
                )}

                {formError && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 text-sm rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleStartScan}
                    disabled={!selectedStudent}
                    className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                      selectedStudent
                        ? "bg-green-700 text-white hover:bg-green-800"
                        : "bg-green-100 text-green-300 cursor-not-allowed"
                    }`}
                  >
                    Mulai Tes →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: SCANNING ── */}
            {step === "scanning" && (
              <div className="py-4 flex flex-col items-center gap-5 text-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-40" />
                  <div className="absolute inset-2 rounded-full border-4 border-green-300 animate-ping opacity-30 [animation-delay:0.3s]" />
                  <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-green-900 text-sm">Menunggu ESP32</p>
                  <p className="text-xs text-green-500 mt-1">
                    Minta siswa untuk meniupkan napas ke sensor…
                  </p>
                </div>

                {selectedStudent && (
                  <div className="w-full bg-green-50 rounded-xl p-3 text-left space-y-1">
                    <p className="text-xs text-green-600">
                      <span className="font-medium">Nama:</span> {selectedStudent.nama}
                    </p>
                    <p className="text-xs text-green-600">
                      <span className="font-medium">NIS:</span> {selectedStudent.nis}
                    </p>
                    <p className="text-xs text-green-600">
                      <span className="font-medium">Kelas:</span> {selectedStudent.kelas}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCancel}
                  className="text-xs text-green-500 underline hover:text-green-700"
                >
                  Batalkan dan kembali ke form
                </button>
              </div>
            )}

            {/* ── STEP: CONFIRM ── */}
            {step === "confirm" && sensorResult && selectedStudent && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                    Data Siswa
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Nama</p>
                      <p className="font-medium text-gray-800 mt-0.5">{selectedStudent.nama}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">NIS</p>
                      <p className="font-mono font-medium text-gray-800 mt-0.5">{selectedStudent.nis}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Kelas</p>
                      <p className="font-medium text-gray-800 mt-0.5">{selectedStudent.kelas}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hasil Sensor
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 font-mono">
                        {sensorResult.nilai_sensor}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Nilai sensor (ADC)</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      categoryColor[sensorResult.kategori] ?? "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      {sensorResult.kategori}
                    </span>
                  </div>
                </div>

                {postError && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {postError}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={posting}
                    className="flex-1 py-2 text-sm rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-40"
                  >
                    ← Ulang Tes
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={posting}
                    className="flex-1 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {posting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Menyimpan…
                      </>
                    ) : "Simpan Data ✓"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === "success" && (
              <div className="py-4 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-900">Data berhasil disimpan!</p>
                  <p className="text-xs text-green-500 mt-1">
                    Hasil tes{" "}
                    <span className="font-medium">{selectedStudent?.nama}</span>{" "}
                    telah tercatat.
                  </p>
                </div>
                <div className="flex gap-3 w-full pt-1">
                  <button
                    onClick={handleTestNext}
                    className="flex-1 py-2 text-sm rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                  >
                    + Tes Siswa Berikutnya
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 font-medium transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: ERROR ── */}
            {step === "error" && (
              <div className="py-4 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Koneksi gagal</p>
                  <p className="text-xs text-gray-400 mt-1">{postError}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => { setStep("scanning"); setPostError(""); startPolling(); }}
                    className="flex-1 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}