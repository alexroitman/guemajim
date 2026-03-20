import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PendientePage() {
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
        <Link href="/login">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
