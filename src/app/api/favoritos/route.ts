import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { gemachId, itemId } = await req.json();
  if (!gemachId && !itemId) {
    return NextResponse.json({ error: "Se requiere gemachId o itemId." }, { status: 400 });
  }

  const existing = await prisma.favorite.findFirst({
    where: {
      userId: session.user.id,
      ...(gemachId ? { gemachId } : { itemId }),
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      ...(gemachId ? { gemachId } : { itemId }),
    },
  });
  return NextResponse.json({ favorited: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      gemach: {
        include: { user: { select: { name: true } } },
      },
      item: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}
