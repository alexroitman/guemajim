import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth(function proxyHandler(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAuthPage = pathname === "/login" || pathname === "/registro";
  const isAdminPage = pathname.startsWith("/admin");
  const isPlatformPage = !isAuthPage && !isAdminPage && pathname !== "/pendiente";

  const isLoggedIn = !!session;
  const isApproved = session?.user?.status === "APPROVED";
  const isAdmin = session?.user?.role === "ADMIN";

  if (isAuthPage && isLoggedIn) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", req.url));
    if (isApproved) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.redirect(new URL("/pendiente", req.url));
  }

  if (isAdminPage) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPlatformPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPlatformPage && isLoggedIn && !isApproved && !isAdmin) {
    return NextResponse.redirect(new URL("/pendiente", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
