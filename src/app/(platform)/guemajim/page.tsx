"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { GemachCard } from "@/components/GemachCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Heart } from "lucide-react";
import { GEMACH_CATEGORIES } from "@/lib/utils";

export default function GuemajimPage() {
  const { data: session } = useSession();
  const [gemachim, setGemachim] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category && category !== "all") params.set("category", category);
    setLoading(true);
    fetch(`/api/guemajim?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setGemachim(data);
        setLoading(false);
      });
  }, [search, category]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Guemajim</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {gemachim.length} disponibles
          </p>
        </div>
        <Link href="/guemajim/nuevo">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Publicar
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            className="pl-9"
            placeholder="Buscar guemajim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {GEMACH_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : gemachim.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No hay guemajim disponibles</p>
          <Link href="/guemajim/nuevo" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              Publicar el primero
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {gemachim.map((g) => (
            <GemachCard key={g.id} gemach={g} currentUserId={session?.user?.id || ""} />
          ))}
        </div>
      )}
    </div>
  );
}
