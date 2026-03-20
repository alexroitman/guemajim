"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GemachCard } from "@/components/GemachCard";
import { ItemCard } from "@/components/ItemCard";
import { Star } from "lucide-react";

export default function FavoritosPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favoritos")
      .then((r) => r.json())
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      });
  }, []);

  const gemachFavs = favorites.filter((f) => f.gemach);
  const itemFavs = favorites.filter((f) => f.item);

  if (loading) {
    return (
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-[var(--muted)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <Star className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-3" />
        <p className="font-medium text-[var(--foreground)]">Sin favoritos aún</p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Tocá la estrella en cualquier guemach o artículo para guardarlo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[var(--foreground)]">Mis favoritos</h1>

      {gemachFavs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[var(--foreground)]">
            Guemajim ({gemachFavs.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {gemachFavs.map((f) => (
              <GemachCard
                key={f.id}
                gemach={{ ...f.gemach, favorites: [{ id: f.id }] }}
                currentUserId={session?.user?.id || ""}
              />
            ))}
          </div>
        </section>
      )}

      {itemFavs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[var(--foreground)]">
            Artículos ({itemFavs.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {itemFavs.map((f) => (
              <ItemCard
                key={f.id}
                item={{ ...f.item, favorites: [{ id: f.id }] }}
                currentUserId={session?.user?.id || ""}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
