import { NextResponse } from "next/server";
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function DELETE(request) {
  const { tv } = await request.json();
  if (!tv) return NextResponse.json({ error: "Missing tv" }, { status: 400 });

  // List all objects for this TV
  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `${tv}-`,
    })
  );
  const objects = (list.Contents || []).map(obj => ({ Key: obj.Key }));

  if (objects.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 });
  }

  // Delete all objects
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: { Objects: objects },
    })
  );

  return NextResponse.json({ success: true, deleted: objects.length });
}