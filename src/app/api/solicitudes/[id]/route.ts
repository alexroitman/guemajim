import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRequestStatusEmail } from "@/lib/emails";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      item: { include: { user: true } },
      requester: { select: { name: true, email: true } },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }
  if (request.item.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  await prisma.request.update({ where: { id }, data: { status } });

  if (status === "ACCEPTED") {
    await prisma.item.update({
      where: { id: request.itemId },
      data: { status: "TAKEN" },
    });
    // Rechazar otras solicitudes pendientes
    await prisma.request.updateMany({
      where: { itemId: request.itemId, id: { not: id }, status: "PENDING" },
      data: { status: "REJECTED" },
    });
  } else {
    // Si se rechaza, volver a disponible si no hay otras activas
    const otherPending = await prisma.request.count({
      where: { itemId: request.itemId, status: "PENDING" },
    });
    if (otherPending === 0) {
      await prisma.item.update({
        where: { id: request.itemId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  await sendRequestStatusEmail(
    request.requester.email,
    request.requester.name,
    request.item.title,
    status === "ACCEPTED"
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
