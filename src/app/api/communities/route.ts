import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json(communities);
  } catch (err) {
    console.error("communities error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
