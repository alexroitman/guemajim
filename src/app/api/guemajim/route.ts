import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const communityId = searchParams.get("communityId") || "";

  const gemachim = await prisma.gemach.findMany({
    where: {
      isActive: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(category && { category }),
      ...(communityId && {
        OR: [
          { allCommunities: true },
          { communities: { some: { communityId } } },
        ],
      }),
      ...(!communityId && {}),
    },
    include: {
      user: { select: { name: true } },
      communities: { include: { community: { select: { name: true } } } },
      favorites: { where: { userId: session.user.id }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(gemachim);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { name, category, description, contact, allCommunities, communityIds } =
    await req.json();

  if (!name || !category || !description || !contact) {
    return NextResponse.json({ error: "Campos requeridos faltantes." }, { status: 400 });
  }

  const gemach = await prisma.gemach.create({
    data: {
      userId: session.user.id,
      name,
      category,
      description,
      contact,
      allCommunities: allCommunities !== false,
      communities:
        !allCommunities && communityIds?.length
          ? { create: communityIds.map((id: string) => ({ communityId: id })) }
          : undefined,
    },
  });

  return NextResponse.json(gemach, { status: 201 });
}
