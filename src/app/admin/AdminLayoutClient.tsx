"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Users, Building2, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const adminItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/comunidades", label: "Comunidades", icon: Building2 },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar al navegar
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white px-4 py-3 flex items-center justify-between"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl">🕍</span>
          <div>
            <div className="font-bold text-[var(--primary)] text-sm md:text-base">Guemajim</div>
            <div className="text-xs text-[var(--muted-foreground)]">Panel de administración</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop: botón salir */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="hidden md:flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-red-600 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex md:hidden items-center justify-center rounded-xl p-2.5 text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)] transition-colors touch-manipulation"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <nav className="hidden md:flex flex-col w-52 border-r border-[var(--border)] bg-white min-h-[calc(100dvh-57px)] p-3 gap-1 sticky top-[57px] self-start">
          {adminItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
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
        </nav>

        <main
          className="flex-1 p-4 md:p-6"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {children}
        </main>
      </div>

      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de administración"
        className={cn(
          "fixed top-0 right-0 z-50 h-dvh w-64 max-w-[85vw] bg-white shadow-2xl md:hidden",
          "flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Cabecera drawer */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <span className="font-bold text-[var(--primary)] text-sm">Admin</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)] transition-colors touch-manipulation"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-3">
          <ul className="space-y-1" role="list">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors touch-manipulation",
                      active
                        ? "bg-[var(--secondary)] text-[var(--primary)]"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pie: cerrar sesión */}
        <div className="border-t border-[var(--border)] px-3 py-3">
          <button
            onClick={() => {
              setMenuOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-50 transition-colors touch-manipulation"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
