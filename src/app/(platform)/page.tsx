import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Star, Plus, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  const [gemachimCount, itemsCount, requestsCount] = await Promise.all([
    prisma.gemach.count({ where: { isActive: true } }),
    prisma.item.count({ where: { status: "AVAILABLE" } }),
    prisma.request.count({
      where: {
        item: { userId: session!.user.id },
        status: "PENDING",
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="text-center py-6">
        <span className="text-5xl">🕍</span>
        <h1 className="mt-3 text-2xl font-bold text-[var(--foreground)]">
          ¡Bienvenido/a, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Red comunitaria de guemajim y artículos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-bold text-[var(--primary)]">{gemachimCount}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">Guemajim</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-bold text-[var(--primary)]">{itemsCount}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">Disponibles</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-bold text-amber-600">{requestsCount}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">Mis solicitudes</div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[var(--foreground)]">¿Qué querés hacer?</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/guemajim">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-[var(--border)]">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-medium">Ver guemajim</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Explorá los guemajim disponibles
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/articulos">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Artículos para prestar/regalar</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Buscá o publicá artículos
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/favoritos">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium">Mis favoritos</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Guemajim y artículos guardados
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Publicar */}
      <div className="border-t border-[var(--border)] pt-4">
        <h2 className="font-semibold text-[var(--foreground)] mb-3">Publicar</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/guemajim/nuevo">
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Mi guemach
            </Button>
          </Link>
          <Link href="/articulos/nuevo">
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Un artículo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
