import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Setting } from "@/models";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  await connectDB();
  const s = await Setting.findOne({ key: "site" }).lean();
  return Response.json({ settings: { ...DEFAULT_SETTINGS, ...(s || {}) } });
}

export async function PUT(req) {
  if (!(await requireAdmin())) return unauthorized();
  await connectDB();
  const data = await req.json();
  for (const k of ["_id", "key", "createdAt", "updatedAt", "__v"]) delete data[k];
  await Setting.updateOne({ key: "site" }, { $set: data }, { upsert: true });
  return Response.json({ ok: true });
}
