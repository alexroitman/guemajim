"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, User } from "lucide-react";

interface GemachCardProps {
  gemach: {
    id: string;
    name: string;
    category: string;
    description: string;
    contact: string;
    allCommunities: boolean;
    user: { name: string };
    communities: { community: { name: string } }[];
    favorites: { id: string }[];
  };
  currentUserId: string;
}

export function GemachCard({ gemach, currentUserId }: GemachCardProps) {
  const [favorited, setFavorited] = useState(gemach.favorites.length > 0);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    setLoading(true);
    const res = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gemachId: gemach.id }),
    });
    const data = await res.json();
    setFavorited(data.favorited);
    setLoading(false);
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {gemach.name}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {gemach.category}
            </Badge>
          </div>
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="text-[var(--muted-foreground)] hover:text-amber-500 transition-colors flex-shrink-0 mt-0.5"
          >
            <Star
              className={`h-5 w-5 ${favorited ? "fill-amber-400 text-amber-400" : ""}`}
            />
          </button>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
          {gemach.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {gemach.user.name}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {gemach.contact}
          </span>
        </div>

        {!gemach.allCommunities && gemach.communities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {gemach.communities.map((c) => (
              <Badge key={c.community.name} variant="outline" className="text-xs">
                {c.community.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
