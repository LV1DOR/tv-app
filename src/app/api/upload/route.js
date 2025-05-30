import { NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Helper to parse multipart form data
async function parseFormData(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const tv = request.nextUrl.searchParams.get("tv") || "unknown";
  return { file, tv };
}

export async function POST(request) {
  try {
    const { file, tv } = await parseFormData(request);

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${tv}-${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    // Emit Socket.IO event if available
    if (global.io) {
      global.io.emit("mediaUploaded", { filename });
    }

    return NextResponse.json({ filename });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}