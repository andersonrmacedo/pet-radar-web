"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Report } from "@/types/report";

const ReportsMap = dynamic(() => import("@/components/ReportsMap"), {
  ssr: false,
});

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = useState(10);
  const [species, setSpecies] = useState("all");
  const [type, setType] = useState("all");

  function fetchReports(loc: { lat: number; lng: number } | null, r: number) {
    const url = loc
      ? `/reports/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=${r}`
      : `/reports`;
    api
      .get(url)
      .then((res) => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchReports(loc, radius);
      },
      () => fetchReports(null, radius),
    );
  }, [radius]);

  function handleRadiusChange(newRadius: number) {
    setRadius(newRadius);
    fetchReports(userLocation, newRadius);
  }

  const filtered = reports.filter((r) => {
    if (species !== "all" && r.species !== species) return false;
    if (type !== "all" && r.type !== type) return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800">
        <Link href="/" className="text-orange-400 font-bold text-lg">
          🐾 Pet Radar
        </Link>
        <div className="flex items-center gap-3 text-sm text-zinc-400 flex-wrap">
          {/* Filter type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="all">Todos</option>
            <option value="lost">🔴 Perdidos</option>
            <option value="found">🟢 Encontrados</option>
          </select>

          {/* Filter species */}
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
          >
            <option value="all">Todas espécies</option>
            <option value="dog">🐶 Cachorro</option>
            <option value="cat">🐱 Gato</option>
            <option value="other">Outro</option>
          </select>

          {/* Radius slider */}
          {userLocation && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Raio:</span>
              <input
                type="range"
                min={1}
                max={100}
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs w-12">{radius} km</span>
            </div>
          )}

          <span className="text-zinc-600">|</span>
          <span>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
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
        <ReportsMap
          reports={filtered}
          userLocation={userLocation ?? undefined}
        />
      </div>
    </div>
  );
}
