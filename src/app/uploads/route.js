import fs from "fs";
import path from "path";

export async function GET(request) {
  const dir = path.join(process.cwd(), "public", "uploads");
  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    // Directory may not exist yet
  }
  return new Response(JSON.stringify({ files }), {
    headers: { "Content-Type": "application/json" },
  });
}