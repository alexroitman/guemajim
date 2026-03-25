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
import { Star, Phone, User, Send } from "lucide-react";

interface GemachCardProps {
  gemach: {
    id: string;
    name: string;
    category: string;
    description: string;
    contact: string;
    allCommunities: boolean;
    userId?: string;
    user: { name: string };
    communities: { community: { name: string } }[];
    favorites: { id: string }[];
  };
  currentUserId: string;
}

export function GemachCard({ gemach, currentUserId }: GemachCardProps) {
  const [favorited, setFavorited] = useState(gemach.favorites.length > 0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const isOwn = gemach.userId === currentUserId;

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

  async function handleRequest() {
    setRequesting(true);
    const res = await fetch("/api/guemajim-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gemachId: gemach.id, message: message.trim() || undefined }),
    });
    if (res.ok) {
      setRequested(true);
      setDialogOpen(false);
      setMessage("");
    }
    setRequesting(false);
  }

  return (
    <>
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

          {!isOwn && currentUserId && (
            <Button
              size="sm"
              className="w-full gap-1.5"
              variant={requested ? "outline" : "default"}
              disabled={requested}
              onClick={() => setDialogOpen(true)}
            >
              <Send className="h-3.5 w-3.5" />
              {requested ? "Solicitud enviada" : "Solicitar"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar: {gemach.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="gemach-message">Mensaje para el dueño (opcional)</Label>
              <Textarea
                id="gemach-message"
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
            <Button onClick={handleRequest} disabled={requesting}>
              {requesting ? "Enviando..." : "Confirmar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
