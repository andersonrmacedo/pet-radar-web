'use client'

import { useEffect, useRef } from 'react'
import type { Report } from '@/types/report'
import 'leaflet/dist/leaflet.css'

interface Props {
  reports: Report[]
  userLocation?: { lat: number; lng: number }
}

export default function ReportsMap({ reports, userLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    const container = mapRef.current
    if (!container) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Leaflet keeps an internal flag on the container element; this clears it
    // before creating a new map instance to avoid the "already initialized" error.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (container as any)._leaflet_id

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [-14.235, -51.925]

      const zoom = userLocation ? 13 : 4
      const map = L.map(mapRef.current as HTMLDivElement).setView(center, zoom)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      reports.forEach((report) => {
        const color = report.type === 'lost' ? '🔴' : '🟢'
        const label = report.name ?? report.species

        const icon = L.divIcon({
          html: `<div style="background:${report.type === 'lost' ? '#ef4444' : '#22c55e'};color:white;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${color} ${label}</div>`,
          className: '',
          iconAnchor: [0, 0],
        })

        const popup = `
          <div style="min-width:180px">
            ${report.photo_url ? `<img src="${report.photo_url}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
            <strong>${report.type === 'lost' ? 'Perdido' : 'Encontrado'}</strong><br/>
            <span>${report.species} · ${report.size} · ${report.color}</span><br/>
            <span>📞 ${report.contact_phone}</span>
          </div>
        `

        L.marker([report.latitude, report.longitude], { icon })
          .addTo(map)
          .bindPopup(popup)
      })
    })

    return () => {
      cancelled = true
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (container as any)._leaflet_id
    }
  }, [reports, userLocation])

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}