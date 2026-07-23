import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/guards";

// NOTE on storage strategy: images are written straight to the local
// filesystem under `public/uploads/events`, which needs zero external
// setup (no Cloudinary/S3 account) and works great for local dev and any
// traditional Node.js host. It will NOT persist on serverless platforms
// with a read-only/ephemeral filesystem (e.g. Vercel) — if this ever
// deploys there, swap this route's storage calls for an object-storage
// SDK (Cloudinary, Vercel Blob, S3) while keeping the same request/response
// shape so `ImageUploader` doesn't need to change.

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "events");
const PUBLIC_PREFIX = "/uploads/events/";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploaded: { url: string; name: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      errors.push(`${file.name}: only JPG, PNG, and WEBP images are allowed.`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name}: file is larger than 5MB.`);
      continue;
    }

    const filename = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    uploaded.push({ url: `${PUBLIC_PREFIX}${filename}`, name: file.name });
  }

  if (uploaded.length === 0) {
    return NextResponse.json({ error: errors.join(" ") || "Upload failed" }, { status: 400 });
  }

  return NextResponse.json({ uploaded, errors }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await request.json();
  if (typeof url !== "string" || !url.startsWith(PUBLIC_PREFIX) || url.includes("..")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const filename = url.slice(PUBLIC_PREFIX.length);
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // Already gone or never existed — not a failure from the caller's point of view.
  }

  return NextResponse.json({ success: true });
}
