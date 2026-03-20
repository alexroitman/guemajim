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
import { GEMACH_CATEGORIES } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NuevoGuemachPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [category, setCategory] = useState("");
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
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      category,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      contact: (form.elements.namedItem("contact") as HTMLInputElement).value,
      allCommunities,
      communityIds: allCommunities ? [] : selectedCommunities,
    };
    const res = await fetch("/api/guemajim", {
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
    router.push("/guemajim");
  }

  function toggleCommunity(id: string) {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/guemajim">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold">Publicar guemach</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre del guemach</Label>
            <Input id="name" name="name" placeholder="Ej: Guemach de ropa de bebé" required />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
              <SelectContent>
                {GEMACH_CATEGORIES.map((c) => (
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
              placeholder="Describí qué ofrece tu guemach, condiciones, horarios..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact">Contacto</Label>
            <Input id="contact" name="contact" placeholder="WhatsApp, email, teléfono..." required />
          </div>

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
                Todas las comunidades
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
                Comunidades específicas
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
            {loading ? "Publicando..." : "Publicar guemach"}
          </Button>
        </form>
      </div>
    </div>
  );
}
