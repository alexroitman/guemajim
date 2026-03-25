"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Heart,
  Gift,
  Star,
  User,
  LogOut,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/guemajim", label: "Guemajim", icon: Heart },
  { href: "/articulos", label: "Artículos", icon: Gift },
  { href: "/favoritos", label: "Favoritos", icon: Star },
  { href: "/perfil", label: "Mi perfil", icon: User },
];

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notifCount, setNotifCount] = useState(0);

  const isApprovedUser =
    session?.user?.status === "APPROVED" && session?.user?.role !== "ADMIN";

  useEffect(() => {
    if (!isApprovedUser) return;
    fetch("/api/notificaciones")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.total === "number") {
          setNotifCount(data.total);
        }
      })
      .catch(() => {});
  }, [isApprovedUser]);

  return (
    <>
      {/* Header en desktop */}
      <header className="hidden md:flex sticky top-0 z-40 w-full border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🕍</span>
            <span className="font-bold text-[var(--primary)] text-lg">
              Guemajim
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--secondary)] text-[var(--primary)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            {isApprovedUser && (
              <Link
                href="/notificaciones"
                className={cn(
                  "relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/notificaciones"
                    ? "bg-[var(--secondary)] text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Bell className="h-4 w-4" />
                Notificaciones
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-[var(--secondary)] text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-white/90 backdrop-blur-sm px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl">🕍</span>
          <span className="font-bold text-[var(--primary)]">Guemajim</span>
        </Link>
        <div className="flex items-center gap-2">
          {isApprovedUser && (
            <Link
              href="/notificaciones"
              className="relative flex items-center justify-center rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-[var(--secondary)] text-[var(--primary)]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </div>
      </header>

      {/* Bottom nav en mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-amber-100")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
