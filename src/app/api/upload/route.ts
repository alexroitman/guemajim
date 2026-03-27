import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[upload] BLOB_READ_WRITE_TOKEN no está configurado");
    return NextResponse.json({ error: "Almacenamiento no configurado" }, { status: 500 });
  }

  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload] Error al subir a Vercel Blob:", err);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
