import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function getSession(req: NextRequest) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  // NextAuth v5 usa __Secure- prefix en HTTPS, authjs. en HTTP
  const cookieName =
    req.url.startsWith("https")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string; status?: string };
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
