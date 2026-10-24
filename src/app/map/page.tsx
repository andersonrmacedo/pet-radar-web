"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [locationDenied, setLocationDenied] = useState(false);
  const [radius, setRadius] = useState(10);
  const [species, setSpecies] = useState("all");
  const [type, setType] = useState("all");

  const fetchReports = useCallback(
    (loc: { lat: number; lng: number } | null, r: number) => {
      const url = loc
        ? `/reports/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=${r}`
        : `/reports`;
      api
        .get(url)
        .then((res) => setReports(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    fetchReports(userLocation, radius);
  }, [fetchReports, radius, userLocation]);

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationDenied(false);
      },
      () => {
        setLocationDenied(true);
      },
    );
  }

  function handleRadiusChange(newRadius: number) {
    setRadius(newRadius);
  }

  const filtered = reports.filter((r) => {
    if (species !== "all" && r.species !== species) return false;
    if (type !== "all" && r.type !== type) return false;
    return true;
  });

  const selectClass =
    "bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3] text-sm focus:outline-none focus:border-[#F59E0B] transition-colors";

  return (
    <div className="h-screen flex flex-col bg-[#0D1117]">
      {/* Header — duas linhas no mobile, uma linha no desktop */}
      <header className="bg-[#0D1117] border-b border-[#30363D] px-4 pt-3 pb-0">
        {/* Header — linha 1 */}
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="text-[#F59E0B] font-bold text-base tracking-tight">
              Pet Radar
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[#7D8590] hover:text-[#E6EDF3] transition-colors p-1"
              aria-label="Minha conta"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <Link
              href="/new-report"
              className="bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-[#0D1117] text-sm font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              + Reportar
            </Link>
          </div>
        </div>

        {/* Linha 2: filtros — scroll horizontal no mobile */}
        <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`${selectClass} shrink-0`}
          >
            <option value="all">Todos</option>
            <option value="lost">Perdidos</option>
            <option value="found">Encontrados</option>
          </select>

          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className={`${selectClass} shrink-0`}
          >
            <option value="all">Todas espécies</option>
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="other">Outro</option>
          </select>

          {!userLocation && (
            <button
              type="button"
              onClick={requestLocation}
              className="text-[#7D8590] hover:text-[#F59E0B] text-sm whitespace-nowrap shrink-0 transition-colors"
            >
              📍 Usar minha localização
            </button>
          )}

          {userLocation && (
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="range"
                min={1}
                max={100}
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-24 accent-[#F59E0B]"
              />
              <span className="text-[#7D8590] text-sm whitespace-nowrap">
                {radius} km
              </span>
            </div>
          )}

          {locationDenied && !userLocation && (
            <span className="text-[#7D8590] text-sm whitespace-nowrap shrink-0">
              Permissão de localização negada.
            </span>
          )}

          <span className="text-[#7D8590] text-sm whitespace-nowrap shrink-0 ml-auto pl-2">
            {filtered.length} {filtered.length === 1 ? "report" : "reports"}
          </span>
        </div>
      </header>

      {/* Mapa ocupa todo o resto */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117] z-10">
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl animate-pulse">🐾</span>
              <span className="text-[#7D8590] text-sm">Carregando mapa...</span>
            </div>
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
