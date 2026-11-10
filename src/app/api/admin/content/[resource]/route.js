import { guard, beforeSave, afterSave, errorResponse } from "@/lib/registry";
import { escapeRegex } from "@/lib/utils";

export async function GET(req, { params }) {
  const g = await guard(params);
  if (g.error) return g.error;
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim();
  const filter = q && g.cfg.search ? { $or: g.cfg.search.map((f) => ({ [f]: { $regex: escapeRegex(q), $options: "i" } })) } : {};
  let query = g.cfg.model.find(filter).sort(g.cfg.sort).limit(Math.min(Number(sp.get("limit")) || 300, 2000));
  const fields = sp.get("fields");
  if (fields) query = query.select(fields.split(",").join(" "));
  else {
    if (g.cfg.listSelect) query = query.select(g.cfg.listSelect);
    for (const p of g.cfg.populate || []) query = query.populate(p);
  }
  return Response.json({ items: await query.lean() });
}

export async function POST(req, { params }) {
  const g = await guard(params);
  if (g.error) return g.error;
  try {
    const data = await beforeSave(g.resource, await req.json(), true);
    const doc = await g.cfg.model.create(data);
    await afterSave(g.resource, doc);
    const item = doc.toObject();
    delete item.password;
    return Response.json({ item });
  } catch (e) {
    return errorResponse(e);
  }
}
