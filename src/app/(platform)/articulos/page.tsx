"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Gift } from "lucide-react";
import { ITEM_CATEGORIES } from "@/lib/utils";

export default function ArticulosPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category && category !== "all") params.set("category", category);
    if (type && type !== "all") params.set("type", type);
    setLoading(true);
    fetch(`/api/articulos?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [search, category, type]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleRequest(itemId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: "REQUESTED" } : item
      )
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Artículos</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {items.length} disponibles
          </p>
        </div>
        <Link href="/articulos/nuevo">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Publicar
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            className="pl-9"
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="LEND">Para prestar</SelectItem>
              <SelectItem value="GIVE">Para regalar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {ITEM_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Gift className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No hay artículos disponibles</p>
          <Link href="/articulos/nuevo" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              Publicar el primero
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUserId={session?.user?.id || ""}
              onRequest={handleRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
