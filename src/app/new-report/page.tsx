"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

const schema = z.object({
  type: z.enum(["lost", "found"]),
  species: z.enum(["dog", "cat", "other"]),
  size: z.enum(["small", "medium", "large"]),
  color: z.string().min(2, "Mínimo 2 caracteres"),
  name: z.string().optional(),
  description: z.string().optional(),
  latitude: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)), "Latitude inválida"),
  longitude: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)), "Longitude inválida"),
  contact_name: z.string().min(2, "Nome obrigatório"),
  contact_phone: z.string().min(8, "Telefone obrigatório"),
  contact_email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  occurred_at: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function NovoReport() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "ok" | "error"
  >("loading");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "lost", species: "dog", size: "medium" },
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setTimeout(() => setLocationStatus("error"), 0);
      return;
    }

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
        if (value !== undefined && value !== "")
          form.append(key, String(value));
      });
      if (photoFile) form.append("photo", photoFile);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reports`, form);
      router.push("/");
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

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-orange-400 mb-6">
          Reportar animal
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Type */}
          <div className="flex gap-3">
            {(["lost", "found"] as const).map((t) => (
              <label key={t} className="flex-1">
                <input
                  type="radio"
                  value={t}
                  {...register("type")}
                  className="peer hidden"
                />
                <div className="peer-checked:bg-orange-500 peer-checked:border-orange-500 border border-zinc-700 rounded-xl p-3 text-center cursor-pointer transition">
                  {t === "lost" ? "🔴 Perdido" : "🟢 Encontrado"}
                </div>
              </label>
            ))}
          </div>

          {/* Species */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Espécie</label>
            <select
              {...register("species")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            >
              <option value="dog">Cachorro</option>
              <option value="cat">Gato</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Porte</label>
            <select
              {...register("size")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            >
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Cor</label>
            <input
              {...register("color")}
              placeholder="Ex: caramelo, preto e branco"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            />
            {errors.color && (
              <p className="text-red-400 text-sm mt-1">
                {errors.color.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Nome (opcional)
            </label>
            <input
              {...register("name")}
              placeholder="Ex: Rex"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            />
          </div>

          {/* Photo with preview */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Foto (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 file:mr-4 file:bg-orange-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:cursor-pointer"
            />
            {photoPreview && (
              <div className="mt-2 relative w-full h-48 rounded-xl overflow-hidden">
                <Image
                  src={photoPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Localização */}
          <input type="hidden" {...register("latitude")} />
          <input type="hidden" {...register("longitude")} />

          <div
            className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
              locationStatus === "ok"
                ? "bg-green-900/30 text-green-400"
                : locationStatus === "error"
                  ? "bg-red-900/30 text-red-400"
                  : "bg-zinc-900 text-zinc-400"
            }`}
          >
            {locationStatus === "loading" && "📍 Obtendo sua localização..."}
            {locationStatus === "ok" && "✅ Localização obtida com sucesso"}
            {locationStatus === "error" &&
              "❌ Não foi possível obter a localização. Permite o acesso no navegador."}
          </div>

          {/* Date */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Quando aconteceu?
            </label>
            <input
              type="datetime-local"
              {...register("occurred_at")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Seu nome</label>
            <input
              {...register("contact_name")}
              placeholder="Anderson"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            />
            {errors.contact_name && (
              <p className="text-red-400 text-sm mt-1">
                {errors.contact_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Telefone / WhatsApp
            </label>
            <input
              {...register("contact_phone")}
              placeholder="11999999999"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            />
            {errors.contact_phone && (
              <p className="text-red-400 text-sm mt-1">
                {errors.contact_phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Email (opcional)
            </label>
            <input
              {...register("contact_email")}
              placeholder="email@exemplo.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition mt-2"
          >
            {loading ? "Enviando..." : "Publicar report"}
          </button>
        </form>
      </div>
    </main>
  );
}
