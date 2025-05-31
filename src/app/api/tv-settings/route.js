import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const settingsPath = path.join(process.cwd(), "data", "tv-settings.json");

export async function GET(request) {
  const tv = request.nextUrl.searchParams.get("tv");
  const data = JSON.parse(await fs.readFile(settingsPath, "utf-8"));
  return NextResponse.json(data[tv] || {});
}

export async function POST(request) {
  const { tv, width, height } = await request.json();
  const data = JSON.parse(await fs.readFile(settingsPath, "utf-8"));
  data[tv] = { width, height };
  await fs.writeFile(settingsPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}