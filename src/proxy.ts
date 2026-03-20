import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isApproved = session?.user?.status === "APPROVED";
  const isAdmin = session?.user?.role === "ADMIN";

  const isAuthPage =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/registro";
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isPlatformPage =
    !isAuthPage && !isAdminPage && nextUrl.pathname !== "/pendiente";

  if (isAuthPage && isLoggedIn) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", nextUrl));
    if (isApproved) return NextResponse.redirect(new URL("/", nextUrl));
    return NextResponse.redirect(new URL("/pendiente", nextUrl));
  }

  if (isAdminPage && !isAdmin) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isPlatformPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isPlatformPage && isLoggedIn && !isApproved && !isAdmin) {
    return NextResponse.redirect(new URL("/pendiente", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
