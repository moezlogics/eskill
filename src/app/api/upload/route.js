import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSession } from "@/lib/auth";

const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };

export async function POST(req) {
  const s = await getSession();
  if (!s) return Response.json({ error: "Please log in first" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!file || typeof file === "string") return Response.json({ error: "No file received" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext || (ext === "svg" && s.role !== "admin")) return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return Response.json({ error: "Maximum file size is 5MB" }, { status: 400 });
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${name}` });
}
