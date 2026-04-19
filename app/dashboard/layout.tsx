"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Page = "dashboard" | "students" | "export";

function pathToPage(pathname: string): Page {
  if (pathname.includes("students")) return "students";
  if (pathname.includes("export"))   return "export";
  return "dashboard";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const active   = pathToPage(pathname);

  function handleNavigate(page: Page) {
    if (page === "dashboard") router.push("/dashboard");
    else router.push(`/dashboard/${page}`);
  }

  return (
    <div className="flex h-screen bg-green-50 font-sans">
      <Sidebar activePage={active} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
    </div>
  );
}