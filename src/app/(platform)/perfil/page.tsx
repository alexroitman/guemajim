import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Heart, Package, ClipboardList } from "lucide-react";

export default async function PerfilPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: {
      community: true,
      _count: {
        select: {
          gemachim: true,
          items: true,
          requests: true,
        },
      },
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Mi perfil</h1>

      {/* Info */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center text-2xl font-bold text-[var(--primary)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-lg">{user.name}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-[var(--muted-foreground)]">DNI: </span>
              <span className="font-medium">{user.dni}</span>
            </div>
            <div>
              <span className="text-[var(--muted-foreground)]">Comunidad: </span>
              <span className="font-medium">{user.community.name}</span>
            </div>
            {user.phone && (
              <div>
                <span className="text-[var(--muted-foreground)]">Tel: </span>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/guemajim">
          <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-3">
              <Heart className="h-5 w-5 text-rose-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{user._count.gemachim}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Guemajim</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/articulos">
          <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-3">
              <Package className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{user._count.items}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Artículos</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/mis-solicitudes">
          <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-3">
              <ClipboardList className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{user._count.requests}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Solicitudes</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <Link href="/mis-solicitudes">
          <Button variant="outline" className="w-full justify-start gap-2">
            <ClipboardList className="h-4 w-4" />
            Mis solicitudes enviadas y recibidas
          </Button>
        </Link>
      </div>

      {/* Salir */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="ghost" className="w-full text-red-600 hover:bg-red-50 gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
