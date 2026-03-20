import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRequestReceivedEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { itemId, message } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "Item requerido." }, { status: 400 });
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId, status: "AVAILABLE" },
    include: { user: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Artículo no disponible." }, { status: 404 });
  }
  if (item.userId === session.user.id) {
    return NextResponse.json({ error: "No podés solicitar tu propio artículo." }, { status: 400 });
  }

  const existing = await prisma.request.findFirst({
    where: { itemId, requesterId: session.user.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya enviaste una solicitud para este artículo." }, { status: 409 });
  }

  const request = await prisma.request.create({
    data: { requesterId: session.user.id, itemId, message },
    include: { requester: { select: { name: true } } },
  });

  await prisma.item.update({
    where: { id: itemId },
    data: { status: "REQUESTED" },
  });

  await sendRequestReceivedEmail(
    item.user.email,
    item.user.name,
    item.title,
    request.requester.name,
    request.id
  ).catch(() => {});

  return NextResponse.json(request, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode"); // "sent" | "received"

  if (mode === "received") {
    const requests = await prisma.request.findMany({
      where: { item: { userId: session.user.id } },
      include: {
        requester: { select: { name: true, email: true, phone: true } },
        item: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  }

  const requests = await prisma.request.findMany({
    where: { requesterId: session.user.id },
    include: {
      item: {
        select: {
          title: true,
          type: true,
          user: { select: { name: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
