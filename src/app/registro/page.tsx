"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Community {
  id: string;
  name: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityId, setCommunityId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [dniPreview, setDniPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((data) => setCommunities(data));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setDniFile(file);
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setDniPreview(url);
    } else {
      setDniPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!communityId) {
      setError("Seleccioná tu comunidad.");
      return;
    }
    if (!dniFile) {
      setError("Por favor adjuntá una foto de tu DNI.");
      return;
    }
    setLoading(true);

    // Upload DNI image first
    let dniImageUrl: string | null = null;
    try {
      const formData = new FormData();
      formData.append("file", dniFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        dniImageUrl = uploadData.url;
      }
    } catch {
      // If upload fails, proceed without image — don't block registration
    }

    const form = e.currentTarget;
    const body = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      dni: (form.elements.namedItem("dni") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      communityId,
      dniImageUrl,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrarse.");
        return;
      }

      router.push("/pendiente");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🕍</span>
          <h1 className="mt-3 text-2xl font-bold text-[var(--foreground)]">
            Guemajim
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Registrate para unirte a la comunidad
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5">Crear cuenta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre Apellido"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  name="dni"
                  placeholder="12345678"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="11 1234-5678"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Comunidad</Label>
              <Select onValueChange={setCommunityId} value={communityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná tu comunidad" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dniImage">Foto del DNI</Label>
              <div
                className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 cursor-pointer hover:border-[var(--primary)] transition-colors text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {dniPreview ? (
                  <div className="space-y-2">
                    <img
                      src={dniPreview}
                      alt="Preview DNI"
                      className="mx-auto max-h-32 rounded-lg object-contain"
                    />
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {dniFile?.name} · Click para cambiar
                    </p>
                  </div>
                ) : dniFile ? (
                  <div className="space-y-1">
                    <div className="text-2xl">📄</div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{dniFile.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Click para cambiar</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl">📷</div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Subí una foto de tu DNI
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Imagen o PDF · Requerido
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="dniImage"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="text-[var(--primary)] font-medium hover:underline"
          >
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
