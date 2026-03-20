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
import { ArrowLeft, ArrowRightLeft, Gift } from "lucide-react";
import Link from "next/link";

export default function NuevoArticuloPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"LEND" | "GIVE">("LEND");
  const [allCommunities, setAllCommunities] = useState(true);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/communities").then((r) => r.json()).then(setCommunities);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!category) { setError("Seleccioná una categoría."); return; }
    setLoading(true);
    const form = e.currentTarget;
    const body = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      category,
      type,
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
