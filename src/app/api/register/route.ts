import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendNewRegistrationEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, dni, phone, communityId, dniImageUrl } = await req.json();

    if (!name || !email || !password || !dni || !communityId) {
      return NextResponse.json({ error: "Campos requeridos faltantes." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { dni }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email o DNI." },
        { status: 409 }
      );
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId, isActive: true },
    });
    if (!community) {
      return NextResponse.json({ error: "Comunidad no válida." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hashed, dni, phone, communityId, dniImageUrl: dniImageUrl || null },
    });

    // Notificar a admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    for (const admin of admins) {
      await sendNewRegistrationEmail(admin.email, name, email, dni, community.name).catch(() => {});
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
