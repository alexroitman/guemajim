import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const { status, responseMessage } = await req.json();

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const request = await prisma.gemachRequest.findUnique({
    where: { id },
    include: { gemach: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }
  if (request.gemach.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  await prisma.gemachRequest.update({
    where: { id },
    data: { status, responseMessage: responseMessage || null },
  });

  return NextResponse.json({ ok: true });
}
