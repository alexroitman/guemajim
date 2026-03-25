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
import { Star, User, ArrowRightLeft, Gift, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { ITEM_TYPE_LABELS, ITEM_STATUS_LABELS } from "@/lib/utils";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: "LEND" | "GIVE";
    status: "AVAILABLE" | "REQUESTED" | "TAKEN";
    imageUrls: string[];
    availableFrom?: string | null;
    availableTo?: string | null;
    allCommunities: boolean;
    userId?: string;
    user: { name: string; phone?: string | null };
    communities: { community: { name: string } }[];
    favorites: { id: string }[];
  };
  currentUserId: string;
  onRequest?: (itemId: string) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function CalendarModal({ item, onClose }: { item: ItemCardProps["item"]; onClose: () => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const from = item.availableFrom ? new Date(item.availableFrom) : null;
  const to = item.availableTo ? new Date(item.availableTo) : null;

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday first

  function isInRange(day: number) {
    if (!from && !to) return false;
    const d = new Date(year, month, day);
    if (from && to) return d >= from && d <= to;
    if (from) return d >= from;
    if (to) return d <= to;
    return false;
  }

  function isStart(day: number) {
    if (!from) return false;
    const d = new Date(year, month, day);
    return from.getFullYear() === d.getFullYear() && from.getMonth() === d.getMonth() && from.getDate() === d.getDate();
  }

  function isEnd(day: number) {
    if (!to) return false;
    const d = new Date(year, month, day);
    return to.getFullYear() === d.getFullYear() && to.getMonth() === d.getMonth() && to.getDate() === d.getDate();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disponibilidad: {item.title}</DialogTitle>
        </DialogHeader>

        {!from && !to ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Sin fechas de disponibilidad definidas.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-[var(--muted)]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-sm">{monthNames[month]} {year}</span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-[var(--muted)]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-[var(--muted-foreground)] mb-1">
              {["Lu","Ma","Mi","Ju","Vi","Sá","Do"].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-px text-center text-sm">
              {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const inRange = isInRange(day);
                const start = isStart(day);
                const end = isEnd(day);
                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded text-sm ${
                      start || end
                        ? "bg-[var(--primary)] text-white font-semibold"
                        : inRange
                        ? "bg-[var(--secondary)] text-[var(--primary)]"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 text-xs text-[var(--muted-foreground)] pt-2 justify-center">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[var(--primary)] inline-block" /> Inicio/Fin
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[var(--secondary)] inline-block" /> Disponible
              </span>
            </div>
          </>
        )}

        {(from || to) && (
          <p className="text-xs text-center text-[var(--muted-foreground)]">
            {from && to && `${formatDate(item.availableFrom!)} → ${formatDate(item.availableTo!)}`}
            {from && !to && `Desde ${formatDate(item.availableFrom!)}`}
            {!from && to && `Hasta ${formatDate(item.availableTo!)}`}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ItemCard({ item, currentUserId, onRequest }: ItemCardProps) {
  const [favorited, setFavorited] = useState(item.favorites.length > 0);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

  const isOwner = item.userId === currentUserId;
  const photos = item.imageUrls ?? [];

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
        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="h-36 overflow-hidden bg-[var(--muted)] relative">
            <img
              src={photos[photoIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-0.5 text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-0.5 text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === photoIndex ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
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

          {/* Fechas disponibilidad */}
          {item.type === "LEND" && (item.availableFrom || item.availableTo) && (
            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {item.availableFrom && item.availableTo
                  ? `${formatDate(item.availableFrom)} → ${formatDate(item.availableTo)}`
                  : item.availableFrom
                  ? `Desde ${formatDate(item.availableFrom)}`
                  : `Hasta ${formatDate(item.availableTo!)}`}
              </span>
            </div>
          )}

          {!item.allCommunities && item.communities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.communities.map((c) => (
                <Badge key={c.community.name} variant="outline" className="text-xs">
                  {c.community.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {/* Botón calendario solo para el dueño (artículos LEND) */}
            {isOwner && item.type === "LEND" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0"
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            )}

            {item.status === "AVAILABLE" && !isOwner && (
              <Button
                size="sm"
                className="w-full"
                onClick={() => setDialogOpen(true)}
              >
                Solicitar
              </Button>
            )}
          </div>
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

      {calendarOpen && (
        <CalendarModal item={item} onClose={() => setCalendarOpen(false)} />
      )}
    </>
  );
}
