import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendUserApprovedEmail, sendUserRejectedEmail } from "@/lib/emails";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED") {
    await sendUserApprovedEmail(user.email, user.name).catch(() => {});
  } else {
    await sendUserRejectedEmail(user.email, user.name).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
