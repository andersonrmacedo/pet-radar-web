import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-400">🐾 Pet Radar</h1>
        <p className="text-zinc-400 mt-2 text-lg">Mapa colaborativo de animais perdidos e encontrados</p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/new-report"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Reportar animal
        </Link>
        <Link
          href="/map"
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold px-6 py-3 rounded-xl transition"
        >
          Ver mapa
        </Link>
      </div>
    </main>
  )
}