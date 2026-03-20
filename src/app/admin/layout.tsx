import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Users, Building2, LayoutDashboard, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Admin header */}
      <header className="border-b border-[var(--border)] bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕍</span>
          <div>
            <div className="font-bold text-[var(--primary)]">Guemajim</div>
            <div className="text-xs text-[var(--muted-foreground)]">Panel de administración</div>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </form>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden md:flex flex-col w-52 border-r border-[var(--border)] bg-white min-h-[calc(100vh-57px)] p-3 gap-1">
          {[
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/usuarios", label: "Usuarios", icon: Users },
            { href: "/admin/comunidades", label: "Comunidades", icon: Building2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-white flex justify-around py-2">
          {[
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/usuarios", label: "Usuarios", icon: Users },
            { href: "/admin/comunidades", label: "Comunidades", icon: Building2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[var(--muted-foreground)]"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
