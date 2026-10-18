// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363D]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="text-[#F59E0B] font-bold text-base tracking-tight">Pet Radar</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[#7D8590] hover:text-[#E6EDF3] text-sm font-medium transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="bg-[#F59E0B] hover:bg-[#D97706] text-[#0D1117] text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            Criar conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
        <h1 className="text-4xl font-bold leading-tight max-w-sm">
          Encontre e reporte<br />
          <span className="text-[#F59E0B]">animais perdidos</span>
        </h1>
        <p className="text-[#7D8590] text-base max-w-xs">
          Mapa colaborativo para ajudar animais perdidos a voltarem pra casa.
        </p>
        <Link
          href="/map"
          className="bg-[#F59E0B] hover:bg-[#D97706] text-[#0D1117] font-bold px-8 py-4 rounded-2xl text-base transition-colors"
        >
          Ver mapa
        </Link>
      </main>
    </div>
  );
}