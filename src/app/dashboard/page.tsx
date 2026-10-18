"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Report } from "@/types/report";

const speciesLabel: Record<string, string> = { dog: "Cachorro", cat: "Gato", other: "Outro" };
const sizeLabel: Record<string, string> = { small: "Pequeno", medium: "Médio", large: "Grande" };

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    api.get("/reports/my")
      .then((res) => setReports(res.data))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <span className="text-3xl animate-pulse">🐾</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#30363D]">
        <Link href="/map" className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="text-[#F59E0B] font-bold text-base tracking-tight">Pet Radar</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-[#7D8590] hover:text-[#E6EDF3] text-sm font-medium transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Título + botão novo report */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Meus reports</h1>
            <p className="text-[#7D8590] text-sm mt-0.5">{reports.length} {reports.length === 1 ? "report" : "reports"}</p>
          </div>
          <Link
            href="/new-report"
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#0D1117] text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            + Novo report
          </Link>
        </div>

        {/* Empty state */}
        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-5xl">🐾</span>
            <p className="text-[#E6EDF3] font-medium">Nenhum report ainda</p>
            <p className="text-[#7D8590] text-sm">Encontrou ou perdeu um animal? Reporte agora.</p>
            <Link href="/new-report" className="mt-2 text-[#F59E0B] hover:underline text-sm font-medium">
              Criar primeiro report →
            </Link>
          </div>
        )}

        {/* Lista */}
        <div className="flex flex-col gap-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
              {r.photo_url && (
                <div className="relative w-full h-48">
                  <Image src={r.photo_url} alt="foto" fill className="object-cover" />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    r.type === "lost"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-green-500/15 text-green-400"
                  }`}>
                    {r.type === "lost" ? "Perdido" : "Encontrado"}
                  </span>
                  <span className="text-[#7D8590] text-xs">
                    {speciesLabel[r.species] ?? r.species} · {sizeLabel[r.size] ?? r.size}
                  </span>
                </div>

                <p className="text-[#E6EDF3] font-medium">
                  {r.name ?? "Sem nome"}{" "}
                  <span className="text-[#7D8590] font-normal text-sm">· {r.color}</span>
                </p>

                {r.description && (
                  <p className="text-[#7D8590] text-sm line-clamp-2">{r.description}</p>
                )}

                <p className="text-[#7D8590] text-sm">📞 {r.contact_phone}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}