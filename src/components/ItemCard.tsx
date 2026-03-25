"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, User, ArrowRightLeft, Gift } from "lucide-react";
import { ITEM_TYPE_LABELS, ITEM_STATUS_LABELS } from "@/lib/utils";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: "LEND" | "GIVE";
    status: "AVAILABLE" | "REQUESTED" | "TAKEN";
    imageUrl: string | null;
    allCommunities: boolean;
    user: { name: string; phone?: string | null };
    communities: { community: { name: string } }[];
    favorites: { id: string }[];
  };
  currentUserId: string;
  onRequest?: (itemId: string) => void;
}

export function ItemCard({ item, currentUserId, onRequest }: ItemCardProps) {
  const [favorited, setFavorited] = useState(item.favorites.length > 0);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  async function toggleFavorite() {
    setLoading(true);
    const res = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });
    const data = await res.json();
    setFavorited(data.favorited);
    setLoading(false);
  }

  async function handleRequest() {
    setRequesting(true);
    const res = await fetch("/api/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, message: message.trim() || undefined }),
    });
    if (res.ok) {
      onRequest?.(item.id);
      setDialogOpen(false);
      setMessage("");
    }
    setRequesting(false);
  }

  const typeVariant = item.type === "LEND" ? "lend" : "give";

  return (
    <>
      <Card className="overflow-hidden">
        {item.imageUrl && (
          <div className="h-36 overflow-hidden bg-[var(--muted)]">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--foreground)] truncate">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge variant={typeVariant} className="text-xs">
                  {item.type === "LEND" ? (
                    <ArrowRightLeft className="h-3 w-3 mr-1" />
                  ) : (
                    <Gift className="h-3 w-3 mr-1" />
                  )}
                  {ITEM_TYPE_LABELS[item.type]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                {item.status !== "AVAILABLE" && (
                  <Badge variant="muted" className="text-xs">
                    {ITEM_STATUS_LABELS[item.status]}
                  </Badge>
                )}
              </div>
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
            {item.description}
          </p>

          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <User className="h-3.5 w-3.5" />
            {item.user.name}
          </div>

          {!item.allCommunities && item.communities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.communities.map((c) => (
                <Badge key={c.community.name} variant="outline" className="text-xs">
                  {c.community.name}
                </Badge>
              ))}
            </div>
          )}

          {item.status === "AVAILABLE" && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => setDialogOpen(true)}
            >
              Solicitar
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar: {item.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-message">Mensaje para el dueño (opcional)</Label>
              <Textarea
                id="item-message"
                placeholder="Podés agregar un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setMessage("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequest}
              disabled={requesting}
            >
              {requesting ? "Enviando..." : "Confirmar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
