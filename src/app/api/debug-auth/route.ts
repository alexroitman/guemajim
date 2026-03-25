import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@auth/core/jwt";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const secureCookieName = "__Secure-authjs.session-token";
  const plainCookieName = "authjs.session-token";

  const hasSecureCookie = cookie.includes(secureCookieName + "=");
  const hasPlainCookie = cookie.includes(plainCookieName + "=");

  const secretPresent = !!process.env.AUTH_SECRET;
  const secretLength = process.env.AUTH_SECRET?.length ?? 0;
  const nodeEnv = process.env.NODE_ENV;
  const nextauthUrl = process.env.NEXTAUTH_URL;

  let getTokenSecureResult: string | null = null;
  let getTokenPlainResult: string | null = null;
  let authResult: string | null = null;
  let getTokenSecureError: string | null = null;
  let getTokenPlainError: string | null = null;
  let authError: string | null = null;

  // Test getToken with secureCookie=true
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
      secureCookie: true,
    });
    getTokenSecureResult = token ? JSON.stringify({ role: (token as any).role, status: (token as any).status }) : "null";
  } catch (e) {
    getTokenSecureError = String(e);
  }

  // Test getToken with secureCookie=false
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
      secureCookie: false,
    });
    getTokenPlainResult = token ? JSON.stringify({ role: (token as any).role, status: (token as any).status }) : "null";
  } catch (e) {
    getTokenPlainError = String(e);
  }

  // Test auth()
  try {
    const session = await auth();
    authResult = session ? JSON.stringify({ role: (session.user as any)?.role, status: (session.user as any)?.status }) : "null";
  } catch (e) {
    authError = String(e);
  }

  return NextResponse.json({
    hasSecureCookie,
    hasPlainCookie,
    secretPresent,
    secretLength,
    nodeEnv,
    nextauthUrl,
    getTokenSecureResult,
    getTokenSecureError,
    getTokenPlainResult,
    getTokenPlainError,
    authResult,
    authError,
  });
}
