import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Users, Clock, CheckCircle, Heart, Gift } from "lucide-react";

export default async function AdminDashboard() {
  const [pending, approved, rejected, gemachim, items] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING", role: "USER" } }),
    prisma.user.count({ where: { status: "APPROVED", role: "USER" } }),
    prisma.user.count({ where: { status: "REJECTED", role: "USER" } }),
    prisma.gemach.count({ where: { isActive: true } }),
    prisma.item.count({ where: { status: { not: "TAKEN" } } }),
  ]);

  const stats = [
    { label: "Pendientes", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/usuarios?status=PENDING" },
    { label: "Aprobados", value: approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", href: "/admin/usuarios?status=APPROVED" },
    { label: "Total usuarios", value: approved + rejected + pending, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/usuarios" },
    { label: "Guemajim activos", value: gemachim, icon: Heart, color: "text-rose-600", bg: "bg-rose-50", href: "/guemajim" },
    { label: "Artículos activos", value: items, icon: Gift, color: "text-purple-600", bg: "bg-purple-50", href: "/articulos" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-amber-800">
              {pending} usuario{pending !== 1 ? "s" : ""} esperando aprobación
            </div>
            <div className="text-sm text-amber-600">Revisá y aprobá los registros pendientes</div>
          </div>
          <Link
            href="/admin/usuarios?status=PENDING"
            className="bg-amber-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Ver
          </Link>
        </div>
      )}
    </div>
  );
}
