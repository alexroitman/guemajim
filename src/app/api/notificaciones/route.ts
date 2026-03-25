import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const [itemRequests, gemachRequests] = await Promise.all([
    prisma.request.findMany({
      where: {
        status: "PENDING",
        item: { userId: session.user.id },
      },
      include: {
        requester: { select: { name: true, phone: true } },
        item: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gemachRequest.findMany({
      where: {
        status: "PENDING",
        gemach: { userId: session.user.id },
      },
      include: {
        requester: { select: { name: true, phone: true } },
        gemach: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    items: itemRequests,
    gemachs: gemachRequests,
    total: itemRequests.length + gemachRequests.length,
  });
}
