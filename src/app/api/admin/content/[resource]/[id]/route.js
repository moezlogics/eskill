import { guard, beforeSave, afterSave, errorResponse } from "@/lib/registry";

export async function GET(req, { params }) {
  const g = await guard(params);
  if (g.error) return g.error;
  const item = await g.cfg.model.findById(g.id).lean().catch(() => null);
  return item ? Response.json({ item }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req, { params }) {
  const g = await guard(params);
  if (g.error) return g.error;
  try {
    const data = await beforeSave(g.resource, await req.json(), false);
    const doc = await g.cfg.model.findByIdAndUpdate(g.id, data, { new: true, runValidators: true });
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    await afterSave(g.resource, doc);
    const item = doc.toObject();
    delete item.password;
    return Response.json({ item });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req, { params }) {
  const g = await guard(params);
  if (g.error) return g.error;
  try {
    await g.cfg.model.findByIdAndDelete(g.id);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
