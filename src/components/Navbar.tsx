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
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/guemajim", label: "Guemajim", icon: Heart },
  { href: "/articulos", label: "Artículos", icon: Gift },
  { href: "/favoritos", label: "Favoritos", icon: Star },
  { href: "/mis-solicitudes", label: "Mis solicitudes", icon: ClipboardList },
  { href: "/perfil", label: "Mi perfil", icon: User },
];

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Cerrar el drawer al navegar
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Cerrar al presionar Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Bloquear scroll del body cuando el menú está abierto
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
    <>
      {/* Header — visible en mobile y desktop */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl">🕍</span>
            <span className="font-bold text-[var(--primary)] text-base md:text-lg">
              Guemajim
            </span>
          </Link>

          {/* Desktop: nav central */}
          <nav className="hidden md:flex items-center gap-1">
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

          {/* Desktop: botón salir */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="hidden md:flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>

          {/* Mobile: iconos de acción + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            {isApprovedUser && (
              <Link
                href="/notificaciones"
                className="relative flex items-center justify-center rounded-xl p-2.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)] transition-colors touch-manipulation"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium bg-[var(--secondary)] text-[var(--primary)] touch-manipulation"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center justify-center rounded-xl p-2.5 text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)] transition-colors touch-manipulation"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay oscuro */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={cn(
          "fixed top-0 right-0 z-50 h-dvh w-72 max-w-[85vw] bg-white shadow-2xl md:hidden",
          "flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Cabecera del drawer */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕍</span>
            <span className="font-bold text-[var(--primary)]">Guemajim</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)] transition-colors touch-manipulation"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items de navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
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
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </Link>
                </li>
              );
            })}

            {isApprovedUser && (
              <li>
                <Link
                  href="/notificaciones"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors touch-manipulation",
                    pathname === "/notificaciones"
                      ? "bg-[var(--secondary)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)]"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Bell
                      className={cn(
                        "h-5 w-5",
                        pathname === "/notificaciones"
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted-foreground)]"
                      )}
                    />
                    {notifCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </div>
                  Notificaciones
                  {notifCount > 0 && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold rounded-full px-2 py-0.5">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </Link>
              </li>
            )}

            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors touch-manipulation",
                    pathname.startsWith("/admin")
                      ? "bg-[var(--secondary)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--muted)]"
                  )}
                >
                  <ShieldCheck
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      pathname.startsWith("/admin")
                        ? "text-[var(--primary)]"
                        : "text-[var(--muted-foreground)]"
                    )}
                  />
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Pie del drawer: info del usuario + cerrar sesión */}
        <div className="border-t border-[var(--border)] px-3 py-3 space-y-1">
          {session?.user?.name && (
            <div className="px-4 py-2">
              <p className="text-xs text-[var(--muted-foreground)]">Conectado como</p>
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {session.user.name}
              </p>
            </div>
          )}
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
    </>
  );
}
