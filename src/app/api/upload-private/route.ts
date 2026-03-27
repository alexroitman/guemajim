import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  try {
    const blob = await put(file.name, file, { access: "private" });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload-private] Error al subir a Vercel Blob:", err);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
