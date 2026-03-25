import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // In production with BLOB_READ_WRITE_TOKEN configured, use @vercel/blob
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch {
    // Fallback for local dev when BLOB_READ_WRITE_TOKEN is not set
    // Return a placeholder URL so the registration flow still works locally
    const placeholderUrl = `https://placeholder.blob.vercel-storage.com/${Date.now()}-${file.name}`;
    return NextResponse.json({ url: placeholderUrl });
  }
}
