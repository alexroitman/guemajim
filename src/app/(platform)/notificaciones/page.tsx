"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Bell, CheckCircle, XCircle, User, Phone, MessageSquare } from "lucide-react";

type Tab = "items" | "gemachs";

interface ItemNotification {
  id: string;
  requester: { name: string; phone: string | null };
  item: { title: string; type: string };
  message: string | null;
  createdAt: string;
}

interface GemachNotification {
  id: string;
  requester: { name: string; phone: string | null };
  gemach: { name: string };
  message: string | null;
  createdAt: string;
}

interface ActionDialog {
  type: "items" | "gemachs";
  id: string;
  action: "ACCEPTED" | "REJECTED";
}

export default function NotificacionesPage() {
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<ItemNotification[]>([]);
  const [gemachs, setGemachs] = useState<GemachNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<ActionDialog | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notificaciones");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setGemachs(data.gemachs);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  function openActionDialog(
    type: "items" | "gemachs",
    id: string,
    action: "ACCEPTED" | "REJECTED"
  ) {
    setActionDialog({ type, id, action });
    setResponseMessage("");
  }

  async function handleAction() {
    if (!actionDialog) return;
    setSubmitting(true);

    const endpoint =
      actionDialog.type === "items"
        ? `/api/solicitudes/${actionDialog.id}`
        : `/api/guemajim-requests/${actionDialog.id}`;

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionDialog.action,
          responseMessage: responseMessage.trim() || undefined,
        }),
      });

      if (res.ok) {
        if (actionDialog.type === "items") {
          setItems((prev) => prev.filter((i) => i.id !== actionDialog.id));
        } else {
          setGemachs((prev) => prev.filter((g) => g.id !== actionDialog.id));
        }
        setActionDialog(null);
        setResponseMessage("");
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }

  const currentList = tab === "items" ? items : gemachs;

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <h1 className="text-xl font-bold">Notificaciones</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Solicitudes pendientes de respuesta
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setTab("items")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === "items"
                ? "bg-[var(--secondary)] text-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            Artículos
            {items.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("gemachs")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === "gemachs"
                ? "bg-[var(--secondary)] text-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            Guemajim
            {gemachs.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {gemachs.length}
              </span>
            )}
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[var(--muted)] animate-pulse" />
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Bell className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
            <p className="text-[var(--muted-foreground)]">
              No hay solicitudes pendientes de {tab === "items" ? "artículos" : "guemajim"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tab === "items" &&
              items.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{req.item.title}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {req.item.type === "LEND" ? "Para prestar" : "Para regalar"}
                        </Badge>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {req.requester.name}
                      </span>
                      {req.requester.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {req.requester.phone}
                        </span>
                      )}
                    </div>

                    {req.message && (
                      <div className="flex items-start gap-1.5 text-sm">
                        <MessageSquare className="h-3.5 w-3.5 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                        <p className="italic text-[var(--muted-foreground)]">&ldquo;{req.message}&rdquo;</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="success"
                        className="flex-1 gap-1"
                        onClick={() => openActionDialog("items", req.id, "ACCEPTED")}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-1"
                        onClick={() => openActionDialog("items", req.id, "REJECTED")}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rechazar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {tab === "gemachs" &&
              gemachs.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{req.gemach.name}</div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Solicitud de contacto</p>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {req.requester.name}
                      </span>
                      {req.requester.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {req.requester.phone}
                        </span>
                      )}
                    </div>

                    {req.message && (
                      <div className="flex items-start gap-1.5 text-sm">
                        <MessageSquare className="h-3.5 w-3.5 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                        <p className="italic text-[var(--muted-foreground)]">&ldquo;{req.message}&rdquo;</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="success"
                        className="flex-1 gap-1"
                        onClick={() => openActionDialog("gemachs", req.id, "ACCEPTED")}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-1"
                        onClick={() => openActionDialog("gemachs", req.id, "REJECTED")}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rechazar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog !== null} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === "ACCEPTED" ? "Aceptar solicitud" : "Rechazar solicitud"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="response-msg">Mensaje de respuesta (opcional)</Label>
              <Textarea
                id="response-msg"
                placeholder="Podés agregar un mensaje para el solicitante..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog(null);
                setResponseMessage("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={actionDialog?.action === "ACCEPTED" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting
                ? "Procesando..."
                : actionDialog?.action === "ACCEPTED"
                ? "Aceptar"
                : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
