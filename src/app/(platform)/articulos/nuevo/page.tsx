"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEM_CATEGORIES } from "@/lib/utils";
import { ArrowLeft, ArrowRightLeft, Gift, ImagePlus, X } from "lucide-react";
import Link from "next/link";

export default function NuevoArticuloPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"LEND" | "GIVE">("LEND");
  const [allCommunities, setAllCommunities] = useState(true);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/communities").then((r) => r.json()).then(setCommunities);
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const combined = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(combined);
    const previews = combined.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!category) { setError("Seleccioná una categoría."); return; }
    if (type === "LEND" && availableFrom && availableTo && availableFrom > availableTo) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }
    setLoading(true);
    const form = e.currentTarget;

    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        imageUrls = await uploadImages();
      } catch {
        setError("Error al subir las imágenes.");
        setLoading(false);
        return;
      }
    }

    const body = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      category,
      type,
      imageUrls,
      availableFrom: type === "LEND" && availableFrom ? availableFrom : undefined,
      availableTo: type === "LEND" && availableTo ? availableTo : undefined,
      allCommunities,
      communityIds: allCommunities ? [] : selectedCommunities,
    };
    const res = await fetch("/api/articulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al publicar.");
      setLoading(false);
      return;
    }
    router.push("/articulos");
  }

  function toggleCommunity(id: string) {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/articulos">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold">Publicar artículo</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de publicación</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("LEND")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                  type === "LEND"
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <ArrowRightLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Para prestar</span>
              </button>
              <button
                type="button"
                onClick={() => setType("GIVE")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                  type === "GIVE"
                    ? "border-purple-400 bg-purple-50 text-purple-700"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <Gift className="h-5 w-5" />
                <span className="text-sm font-medium">Para regalar</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" placeholder="Ej: Cochecito de bebé" required />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
              <SelectContent>
                {ITEM_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describí el estado, condiciones, tamaño..."
              rows={3}
              required
            />
          </div>

          {/* Fechas disponibilidad (solo LEND) */}
          {type === "LEND" && (
            <div className="space-y-2">
              <Label>Disponibilidad (opcional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-[var(--muted-foreground)]">Desde</span>
                  <Input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-[var(--muted-foreground)]">Hasta</span>
                  <Input
                    type="date"
                    value={availableTo}
                    onChange={(e) => setAvailableTo(e.target.value)}
                    min={availableFrom || undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fotos */}
          <div className="space-y-2">
            <Label>Fotos (opcional, hasta 5)</Label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--muted)]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--muted)] transition-colors">
                    <ImagePlus className="h-5 w-5 text-[var(--muted-foreground)]" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            )}
            {imagePreviews.length === 0 && (
              <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] py-6 cursor-pointer hover:bg-[var(--muted)] transition-colors">
                <ImagePlus className="h-6 w-6 text-[var(--muted-foreground)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Agregar fotos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Visibilidad */}
          <div className="space-y-2">
            <Label>Visibilidad</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAllCommunities(true)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm text-center transition-colors ${
                  allCommunities
                    ? "border-[var(--primary)] bg-[var(--secondary)] text-[var(--primary)] font-medium"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setAllCommunities(false)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm text-center transition-colors ${
                  !allCommunities
                    ? "border-[var(--primary)] bg-[var(--secondary)] text-[var(--primary)] font-medium"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                Específicas
              </button>
            </div>
            {!allCommunities && (
              <div className="flex flex-wrap gap-2 pt-1">
                {communities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCommunity(c.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedCommunities.includes(c.id)
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Publicando..." : "Publicar artículo"}
          </Button>
        </form>
      </div>
    </div>
  );
}
