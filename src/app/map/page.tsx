'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import axios from 'axios'
import type { Report } from '@/types/report'

const ReportsMap = dynamic(() => import('@/components/ReportsMap'), { ssr: false })

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/reports`)
      .then((res) => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800">
        <Link href="/" className="text-orange-400 font-bold text-lg">🐾 Pet Radar</Link>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>🔴 Perdido</span>
          <span>🟢 Encontrado</span>
          <span className="text-zinc-600">|</span>
          <span>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
        </div>
        <Link
          href="/new-report"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Reportar
        </Link>
      </header>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
            <span className="text-zinc-400">Carregando mapa...</span>
          </div>
        )}
        <ReportsMap reports={reports} userLocation={userLocation} />
      </div>
    </div>
  )
}