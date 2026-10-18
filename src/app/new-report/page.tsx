"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

const schema = z.object({
  type: z.enum(["lost", "found"]),
  species: z.enum(["dog", "cat", "other"]),
  size: z.enum(["small", "medium", "large"]),
  color: z.string().min(2, "Mínimo 2 caracteres"),
  name: z.string().optional(),
  description: z.string().optional(),
  latitude: z.string().refine((v) => !isNaN(parseFloat(v)), "Latitude inválida"),
  longitude: z.string().refine((v) => !isNaN(parseFloat(v)), "Longitude inválida"),
  contact_name: z.string().min(2, "Nome obrigatório"),
  contact_phone: z.string().min(8, "Telefone obrigatório"),
  contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
  occurred_at: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function NovoReport() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ok" | "error">("loading");

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "lost", species: "dog", size: "medium" },
  });

  const selectedType = useWatch({ control, name: "type" });
  const selectedSpecies = useWatch({ control, name: "species" });
  const selectedSize = useWatch({ control, name: "size" });

  useEffect(() => {
    if (!navigator.geolocation) { setTimeout(() => setLocationStatus("error"), 0); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", String(pos.coords.latitude));
        setValue("longitude", String(pos.coords.longitude));
        setLocationStatus("ok");
      },
      () => setLocationStatus("error")
    );
  }, [setValue]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") form.append(key, String(value));
      });
      if (photoFile) form.append("photo", photoFile);
      await api.post("/reports", form);
      router.push("/map");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Erro ao enviar report");
      } else {
        setError("Erro inesperado");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3 text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-[#F59E0B] transition-colors";
  const labelClass = "text-[#7D8590] text-sm mb-2 block font-medium";

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0D1117]/95 backdrop-blur border-b border-[#30363D] px-4 py-4 flex items-center gap-3">
        <Link href="/map" className="text-[#7D8590] hover:text-[#E6EDF3] transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="font-semibold text-lg">Reportar animal</h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto px-4 pb-32 pt-6 flex flex-col gap-6">

        {/* Tipo */}
        <div>
          <p className={labelClass}>O animal está</p>
          <div className="grid grid-cols-2 gap-3">
            {(["lost", "found"] as const).map((t) => (
              <label key={t} className="cursor-pointer">
                <input type="radio" value={t} {...register("type")} className="sr-only" />
                <div className={`rounded-2xl p-4 border-2 transition-all text-center ${
                  selectedType === t
                    ? t === "lost"
                      ? "bg-red-500/10 border-red-500 text-red-400"
                      : "bg-green-500/10 border-green-500 text-green-400"
                    : "bg-[#161B22] border-[#30363D] text-[#7D8590]"
                }`}>
                  <div className="text-2xl mb-1">{t === "lost" ? "😢" : "🙌"}</div>
                  <div className="font-semibold text-sm">{t === "lost" ? "Perdido" : "Encontrado"}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Espécie */}
        <div>
          <p className={labelClass}>Espécie</p>
          <div className="grid grid-cols-3 gap-3">
            {([["dog", "🐶", "Cachorro"], ["cat", "🐱", "Gato"], ["other", "🐾", "Outro"]] as const).map(([val, emoji, label]) => (
              <label key={val} className="cursor-pointer">
                <input type="radio" value={val} {...register("species")} className="sr-only" />
                <div className={`rounded-2xl p-3 border-2 transition-all text-center ${
                  selectedSpecies === val
                    ? "bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B]"
                    : "bg-[#161B22] border-[#30363D] text-[#7D8590]"
                }`}>
                  <div className="text-xl mb-1">{emoji}</div>
                  <div className="text-xs font-medium">{label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Porte */}
        <div>
          <p className={labelClass}>Porte</p>
          <div className="grid grid-cols-3 gap-3">
            {([["small", "Pequeno", "< 10kg"], ["medium", "Médio", "10–25kg"], ["large", "Grande", "> 25kg"]] as const).map(([val, label, sub]) => (
              <label key={val} className="cursor-pointer">
                <input type="radio" value={val} {...register("size")} className="sr-only" />
                <div className={`rounded-2xl p-3 border-2 transition-all text-center ${
                  selectedSize === val
                    ? "bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B]"
                    : "bg-[#161B22] border-[#30363D] text-[#7D8590]"
                }`}>
                  <div className="text-xs font-semibold">{label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Foto */}
        <div>
          <p className={labelClass}>Foto do animal</p>
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="sr-only"
            />
            {photoPreview ? (
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-[#F59E0B]">
                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                  Trocar foto
                </div>
              </div>
            ) : (
              <div className="w-full h-40 rounded-2xl border-2 border-dashed border-[#30363D] bg-[#161B22] flex flex-col items-center justify-center gap-2 text-[#7D8590] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2l4-4h10l4 4h2a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="text-sm font-medium">Tirar foto ou escolher da galeria</span>
              </div>
            )}
          </label>
        </div>

        {/* Cor e Nome */}
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Cor</label>
            <input {...register("color")} placeholder="Ex: caramelo, preto e branco" className={inputClass} />
            {errors.color && <p className="text-red-400 text-xs mt-1">{errors.color.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nome <span className="text-[#7D8590] font-normal">(se souber)</span></label>
            <input {...register("name")} placeholder="Ex: Rex" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descrição <span className="text-[#7D8590] font-normal">(opcional)</span></label>
            <textarea {...register("description")} placeholder="Detalhes que ajudem a identificar o animal..." rows={3}
              className={`${inputClass} resize-none`} />
          </div>
        </div>

        {/* Localização */}
        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
          locationStatus === "ok" ? "bg-green-500/10 text-green-400 border border-green-500/30"
          : locationStatus === "error" ? "bg-red-500/10 text-red-400 border border-red-500/30"
          : "bg-[#161B22] text-[#7D8590] border border-[#30363D]"
        }`}>
          <span className="text-base">
            {locationStatus === "loading" ? "⏳" : locationStatus === "ok" ? "✅" : "❌"}
          </span>
          <span>
            {locationStatus === "loading" && "Obtendo sua localização..."}
            {locationStatus === "ok" && "Localização capturada"}
            {locationStatus === "error" && "Permita o acesso à localização no navegador"}
          </span>
        </div>

        {/* Data */}
        <div>
          <label className={labelClass}>Quando aconteceu?</label>
          <input type="datetime-local" {...register("occurred_at")} className={inputClass} />
        </div>

        {/* Contato */}
        <div className="flex flex-col gap-4">
          <p className="text-[#E6EDF3] font-semibold text-sm">Seu contato</p>
          <div>
            <label className={labelClass}>Nome</label>
            <input {...register("contact_name")} placeholder="Anderson" className={inputClass} />
            {errors.contact_name && <p className="text-red-400 text-xs mt-1">{errors.contact_name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input {...register("contact_phone")} placeholder="11999999999" inputMode="tel" className={inputClass} />
            {errors.contact_phone && <p className="text-red-400 text-xs mt-1">{errors.contact_phone.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Email <span className="text-[#7D8590] font-normal">(opcional)</span></label>
            <input {...register("contact_email")} placeholder="email@exemplo.com" inputMode="email" className={inputClass} />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
      </form>

      {/* Submit fixo no bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0D1117]/95 backdrop-blur border-t border-[#30363D]">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            form={undefined}
            onClick={handleSubmit(onSubmit)}
            disabled={loading || locationStatus === "loading"}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 text-[#0D1117] font-bold py-4 rounded-2xl transition-colors text-base"
          >
            {loading ? "Publicando..." : "Publicar report"}
          </button>
        </div>
      </div>
    </div>
  );
}