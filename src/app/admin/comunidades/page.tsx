"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, ToggleLeft, ToggleRight } from "lucide-react";

export default function ComunidadesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/communities")
      .then((r) => r.json())
      .then((data) => {
        setCommunities(data);
        setLoading(false);
      });
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear.");
      setCreating(false);
      return;
    }
    setCommunities((prev) => [...prev, { ...data, _count: { users: 0 } }]);
    setNewName("");
    setCreating(false);
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/communities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setCommunities((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
      );
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Comunidades</h1>

      {/* Crear nueva */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-medium text-sm">Nueva comunidad</div>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la comunidad"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              size="sm"
              className="gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Crear
            </Button>
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {communities.map((c) => (
            <Card key={c.id} className={!c.isActive ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mt-0.5">
                      <Users className="h-3.5 w-3.5" />
                      {c._count.users} miembro{c._count.users !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={c.isActive ? "success" : "muted"}>
                    {c.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                  <button
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    {c.isActive ? (
                      <ToggleRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
