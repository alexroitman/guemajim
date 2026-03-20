"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REQUEST_STATUS_LABELS, ITEM_TYPE_LABELS } from "@/lib/utils";
import { ArrowRightLeft, Gift, CheckCircle, XCircle } from "lucide-react";

type Tab = "sent" | "received";

export default function MisSolicitudesPage() {
  const [tab, setTab] = useState<Tab>("sent");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/solicitudes?mode=${tab === "sent" ? "sent" : "received"}`)
      .then((r) => r.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      });
  }, [tab]);

  async function handleAction(requestId: string, status: "ACCEPTED" | "REJECTED") {
    await fetch(`/api/solicitudes/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  }

  const statusVariant: Record<string, any> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "destructive",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Mis solicitudes</h1>

      {/* Tabs */}
      <div className="flex border border-[var(--border)] rounded-xl overflow-hidden">
        {(["sent", "received"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[var(--secondary)] text-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {t === "sent" ? "Enviadas" : "Recibidas"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          No hay solicitudes {tab === "sent" ? "enviadas" : "recibidas"}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {tab === "sent" ? req.item.title : req.item.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {req.item.type === "LEND" ? (
                        <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <Gift className="h-3.5 w-3.5 text-purple-500" />
                      )}
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {ITEM_TYPE_LABELS[req.item.type]}
                      </span>
                    </div>
                  </div>
                  <Badge variant={statusVariant[req.status]}>
                    {REQUEST_STATUS_LABELS[req.status]}
                  </Badge>
                </div>

                {tab === "sent" && req.item.user && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Dueño/a: <span className="font-medium">{req.item.user.name}</span>
                    {req.item.user.phone && req.status === "ACCEPTED" && (
                      <> · {req.item.user.phone}</>
                    )}
                  </p>
                )}

                {tab === "received" && req.requester && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Solicitante: <span className="font-medium">{req.requester.name}</span>
                    {req.requester.phone && (
                      <> · {req.requester.phone}</>
                    )}
                  </p>
                )}

                {req.message && (
                  <p className="text-xs italic text-[var(--muted-foreground)]">
                    "{req.message}"
                  </p>
                )}

                {tab === "received" && req.status === "PENDING" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1 gap-1"
                      onClick={() => handleAction(req.id, "ACCEPTED")}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-1"
                      onClick={() => handleAction(req.id, "REJECTED")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
