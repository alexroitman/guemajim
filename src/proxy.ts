import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@auth/core/jwt";

async function getSession(req: NextRequest) {
  try {
    // Vercel termina SSL en el CDN y reenvía requests como HTTP internamente,
    // por lo que req.url empieza con http:// aunque el cliente use HTTPS.
    // Forzamos secureCookie=true en producción para usar el prefijo __Secure-.
    const secureCookie = process.env.NODE_ENV === "production";
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
      secureCookie,
    });
    return token as { role?: string; status?: string } | null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/registro";
  const isAdminPage = pathname.startsWith("/admin");
  const isPlatformPage = !isAuthPage && !isAdminPage && pathname !== "/pendiente";

  const session = await getSession(req);
  const isLoggedIn = !!session;
  const isApproved = session?.status === "APPROVED";
  const isAdmin = session?.role === "ADMIN";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
