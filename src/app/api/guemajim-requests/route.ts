import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { gemachId, message } = await req.json();
  if (!gemachId) {
    return NextResponse.json({ error: "Gemach requerido." }, { status: 400 });
  }

  const gemach = await prisma.gemach.findUnique({
    where: { id: gemachId, isActive: true },
  });
  if (!gemach) {
    return NextResponse.json({ error: "Gemach no disponible." }, { status: 404 });
  }
  if (gemach.userId === session.user.id) {
    return NextResponse.json({ error: "No podés solicitar tu propio gemach." }, { status: 400 });
  }

  const existing = await prisma.gemachRequest.findFirst({
    where: { gemachId, requesterId: session.user.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ya enviaste una solicitud a este gemach." },
      { status: 409 }
    );
  }

  const request = await prisma.gemachRequest.create({
    data: { requesterId: session.user.id, gemachId, message },
  });

  return NextResponse.json(request, { status: 201 });
}
