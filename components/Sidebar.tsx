"use client";

type Page = "dashboard" | "students" | "export";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { label: string; page: Page; icon: string }[] = [
  { label: "Dashboard", page: "dashboard", icon: "▦" },
  { label: "Siswa",     page: "students",  icon: "◉" },
  { label: "Export",    page: "export",    icon: "↓" },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-green-700 flex flex-col h-screen">
      <div className="px-5 py-4 border-b border-green-600">
        <p className="text-base font-semibold text-white tracking-tight">ROTECH</p>
        <p className="text-xs text-green-300 mt-0.5">Smoke Breath Analyzer</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
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
  );
}