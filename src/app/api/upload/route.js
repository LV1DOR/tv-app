import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${tv}-${Date.now()}-${file.name}`;

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read", // For demo; for production, use signed URLs
      })
    );

    // Emit Socket.IO event if available
    if (global.io) {
      global.io.emit("mediaUploaded", { filename });
    }

    // Return the S3 URL
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    return NextResponse.json({ filename, url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}