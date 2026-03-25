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
  const type = searchParams.get("type") || "";
  const communityId = searchParams.get("communityId") || "";

  const items = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(category && { category }),
      ...(type && { type: type as "LEND" | "GIVE" }),
      ...(communityId && {
        OR: [
          { allCommunities: true },
          { communities: { some: { communityId } } },
        ],
      }),
    },
    include: {
      user: { select: { name: true, phone: true } },
      communities: { include: { community: { select: { name: true } } } },
      favorites: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { requests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { title, description, category, type, imageUrls, availableFrom, availableTo, allCommunities, communityIds } =
    await req.json();

  if (!title || !description || !category || !type) {
    return NextResponse.json({ error: "Campos requeridos faltantes." }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      userId: session.user.id,
      title,
      description,
      category,
      type,
      imageUrls: imageUrls ?? [],
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null,
      allCommunities: allCommunities !== false,
      communities:
        !allCommunities && communityIds?.length
          ? { create: communityIds.map((id: string) => ({ communityId: id })) }
          : undefined,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
