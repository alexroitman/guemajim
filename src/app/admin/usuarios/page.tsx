"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { STATUS_LABELS } from "@/lib/utils";

type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function UsuariosPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<UserStatus | "ALL">(
    (searchParams.get("status") as UserStatus) || "PENDING"
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleAction(userId: string, status: "APPROVED" | "REJECTED") {
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    setActionLoading(null);
  }

  const filters: { value: UserStatus | "ALL"; label: string }[] = [
    { value: "PENDING", label: "Pendientes" },
    { value: "APPROVED", label: "Aprobados" },
    { value: "REJECTED", label: "Rechazados" },
    { value: "ALL", label: "Todos" },
  ];

  const statusVariant: Record<string, any> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Usuarios</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          No hay usuarios en esta categoría
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">{user.email}</div>
                  </div>
                  <Badge variant={statusVariant[user.status]}>
                    {STATUS_LABELS[user.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--muted-foreground)]">DNI: </span>
                    <span className="font-medium">{user.dni}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Comunidad: </span>
                    <span className="font-medium">{user.community?.name}</span>
                  </div>
                  {user.phone && (
                    <div>
                      <span className="text-[var(--muted-foreground)]">Tel: </span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[var(--muted-foreground)]">Registro: </span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>

                {user.dniImageUrl && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-[var(--muted-foreground)] font-medium">Foto DNI</p>
                    <a href={user.dniImageUrl} target="_blank" rel="noopener noreferrer">
                      {user.dniImageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
                       user.dniImageUrl.includes("placeholder") ? (
                        <img
                          src={user.dniImageUrl}
                          alt="DNI"
                          className="h-20 rounded-lg object-cover border border-[var(--border)] hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="text-xs text-[var(--primary)] hover:underline block mt-1">
                        Ver foto del DNI
                      </span>
                    </a>
                  </div>
                )}

                {user.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1 gap-1"
                      disabled={actionLoading === user.id}
                      onClick={() => handleAction(user.id, "APPROVED")}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-1"
                      disabled={actionLoading === user.id}
                      onClick={() => handleAction(user.id, "REJECTED")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar
                    </Button>
                  </div>
                )}
                {user.status === "APPROVED" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    disabled={actionLoading === user.id}
                    onClick={() => handleAction(user.id, "REJECTED")}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Revocar acceso
                  </Button>
                )}
                {user.status === "REJECTED" && (
                  <Button
                    size="sm"
                    variant="success"
                    className="gap-1"
                    disabled={actionLoading === user.id}
                    onClick={() => handleAction(user.id, "APPROVED")}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Aprobar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
