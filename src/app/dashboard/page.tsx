"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Report } from "@/types/report";

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .get("/reports/my")
      .then((res) => setReports(res.data))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p style={{ padding: 32 }}>Carregando...</p>;

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <h1>Meus reports</h1>
      <a href="/new-report">+ Novo report</a>

      {reports.length === 0 && <p>Você ainda não tem reports.</p>}

      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
          }}
        >
          <p>
            <strong>
              {r.type === "lost" ? "🔴 Perdido" : "🟢 Encontrado"}
            </strong>{" "}
            — {r.species}
          </p>
          <p>
            {r.name ? `Nome: ${r.name}` : "Sem nome"} · {r.color}
          </p>
          <p>📞 {r.contact_phone}</p>
          {r.photo_url && (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 200,
                marginTop: 8,
              }}
            >
              <Image
                src={r.photo_url}
                alt="foto"
                fill
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
