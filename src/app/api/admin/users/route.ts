import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(status && { status: status as any }),
    },
    include: { community: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
