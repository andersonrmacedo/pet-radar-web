import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface Report {
  id: string;
  type: "lost" | "found";
  species: string;
  size: string;
  color: string;
  name?: string;
  description?: string;
  photo_url?: string;
  contact_name: string;
  contact_phone: string;
  occurred_at: string;
  latitude: string;
  longitude: string;
}

const speciesLabel: Record<string, string> = {
  dog: "Cachorro",
  cat: "Gato",
  other: "Outro",
};

const sizeLabel: Record<string, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

async function getReport(id: string): Promise<Report | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return { title: "Report não encontrado — Pet Radar" };

  const animal = report.name ?? speciesLabel[report.species] ?? "Animal";
  const status = report.type === "lost" ? "Perdido" : "Encontrado";

  return {
    title: `${animal} ${status} — Pet Radar`,
    description: `${speciesLabel[report.species]}, ${report.color}. Contato: ${report.contact_phone}`,
    openGraph: {
      title: `${animal} ${status} — Pet Radar`,
      description: `${speciesLabel[report.species]}, ${report.color}. Entre em contato: ${report.contact_phone}`,
      images: report.photo_url ? [report.photo_url] : [],
    },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  const animal = report.name ?? speciesLabel[report.species] ?? "Animal";
  const status = report.type === "lost" ? "Perdido" : "Encontrado";
  const date = new Date(report.occurred_at).toLocaleDateString("pt-BR");

  const whatsappText = encodeURIComponent(
    `${report.type === "lost" ? "🔴 Animal PERDIDO" : "🟢 Animal ENCONTRADO"} — Pet Radar\n\n` +
      `${animal} (${speciesLabel[report.species]}, ${report.color})\n` +
      `📅 ${date}\n` +
      `📞 ${report.contact_phone}\n\n` +
      `Ver no mapa: ${process.env.NEXT_PUBLIC_APP_URL}/reports/${report.id}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Header */}
      <header className="px-4 py-4 border-b border-[#30363D] flex items-center gap-3">
        <Link href="/map" className="text-[#7D8590] hover:text-[#E6EDF3] transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="text-[#F59E0B] font-bold text-base tracking-tight">Pet Radar</span>
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-bold px-3 py-1.5 rounded-xl ${
              report.type === "lost"
                ? "bg-red-500/15 text-red-400"
                : "bg-green-500/15 text-green-400"
            }`}
          >
            {status}
          </span>
          <span className="text-[#7D8590] text-sm">{date}</span>
        </div>

        {/* Foto */}
        {report.photo_url && (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden">
            <Image src={report.photo_url} alt={animal} fill className="object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <p className="text-[#7D8590] text-xs font-medium mb-1">Animal</p>
            <p className="text-[#E6EDF3] font-semibold">
              {animal} · {speciesLabel[report.species]} · {sizeLabel[report.size]}
            </p>
          </div>
          <div>
            <p className="text-[#7D8590] text-xs font-medium mb-1">Cor</p>
            <p className="text-[#E6EDF3]">{report.color}</p>
          </div>
          {report.description && (
            <div>
              <p className="text-[#7D8590] text-xs font-medium mb-1">Descrição</p>
              <p className="text-[#E6EDF3]">{report.description}</p>
            </div>
          )}
        </div>

        {/* Contato */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-[#E6EDF3] font-semibold text-sm">Contato</p>
          <p className="text-[#E6EDF3]">{report.contact_name}</p>
          <a
            href={`https://wa.me/55${report.contact_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.858L0 24l6.335-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.378l-.36-.214-3.742.887.936-3.638-.235-.374A9.86 9.86 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z" />
            </svg>
            {report.contact_phone}
          </a>
        </div>

        {/* Compartilhar */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl text-center transition-colors"
        >
          Compartilhar no WhatsApp
        </a>

        <Link
          href="/map"
          className="w-full border border-[#30363D] hover:border-[#F59E0B] text-[#7D8590] hover:text-[#F59E0B] font-medium py-3 rounded-2xl text-center transition-colors text-sm"
        >
          Ver todos no mapa
        </Link>
      </main>
    </div>
  );
}
