"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PendientePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await update();
      if (updated?.user?.status === "APPROVED") {
        router.push("/");
        router.refresh();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [update, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-sm text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Registro recibido
        </h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          Tu solicitud está siendo revisada por la administración. Te
          notificaremos por email cuando sea aprobada.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Esperando aprobación...
        </div>
      </div>
    </div>
  );
}
