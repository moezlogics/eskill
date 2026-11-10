"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, LoaderCircle, ExternalLink } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import { FormFields, emptyValue, clearRelationCache } from "./Form";
import { cn } from "@/lib/utils";

const TONES = {
  pending: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700", rejected: "bg-rose-100 text-rose-700",
  new: "bg-sky-100 text-sky-700", contacted: "bg-amber-100 text-amber-700", interested: "bg-violet-100 text-violet-700",
  converted: "bg-emerald-100 text-emerald-700", closed: "bg-slate-200 text-slate-600",
};
const get = (o, path) => path.split(".").reduce((v, k) => (v == null ? v : v[k]), o);

function Cell({ col, item }) {
  const v = get(item, col.key);
  switch (col.type) {
    case "image":
      return v
        ? <a href={v} target="_blank" rel="noreferrer"><img src={v} alt="" className="h-10 w-14 rounded-lg object-cover ring-1 ring-slate-200" /></a>
        : <div className="h-10 w-14 rounded-lg bg-slate-100" />;
    case "bool":
      return <span className={cn("badge", v ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>{v ? "Yes" : "No"}</span>;
    case "price":
      return v ? `Rs ${Number(v).toLocaleString("en-US")}` : <span className="text-slate-400">—</span>;
    case "date":
      return v ? new Date(v).toLocaleDateString("en-GB") : "—";
    case "status":
      return <span className={cn("badge capitalize", TONES[v] || "bg-slate-100 text-slate-600")}>{v || "—"}</span>;
    case "progress":
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-600" style={{ width: `${v || 0}%` }} /></div>
          <span className="text-xs">{v || 0}%</span>
        </div>
      );
    default:
      return <span className="line-clamp-2 max-w-xs">{v === undefined || v === null || v === "" ? "—" : String(v)}</span>;
  }
}

export default function ResourceManager({ resource }) {
  const cfg = RESOURCES[resource];
  const api = `/api/admin/content/${resource}`;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const send = (url, method, body) =>
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }));

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await send(`${api}?q=${encodeURIComponent(q)}`, "GET");
    setItems(data.items || []);
    setLoading(false);
  }, [api, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function open(item) {
    setError("");
    if (!item) return setEditing(emptyValue(cfg.fields));
    const { ok, data } = await send(`${api}/${item._id}`, "GET");
    if (ok) setEditing(data.item);
  }

  async function save() {
    setSaving(true);
    setError("");
    const isNew = !editing._id;
    const { ok, data } = await send(isNew ? api : `${api}/${editing._id}`, isNew ? "POST" : "PUT", editing);
    setSaving(false);
    if (!ok) return setError(data.error || "Save failed");
    clearRelationCache(resource);
    setEditing(null);
    load();
  }

  async function remove(item) {
    if (!confirm(`Delete this ${cfg.singular.toLowerCase()} permanently?`)) return;
    await send(`${api}/${item._id}`, "DELETE");
    clearRelationCache(resource);
    load();
  }

  async function quick(item, set) {
    const { ok, data } = await send(`${api}/${item._id}`, "PUT", set);
    if (!ok) alert(data.error || "Failed");
    load();
  }

  const shown = status === "all" ? items : items.filter((i) => i.status === status);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{cfg.label}</h1>
          {cfg.intro && <p className="mt-1 max-w-2xl text-[15px] text-muted">{cfg.intro}</p>}
        </div>
        <button onClick={() => open(null)} className="btn btn-primary"><Plus size={18} />Add {cfg.singular.toLowerCase()}</button>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-line bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input py-2.5 pl-10" />
          </div>
          {cfg.statusFilter && (
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {["all", ...cfg.statusFilter].map((st) => (
                <button key={st} onClick={() => setStatus(st)}
                  className={cn("rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap capitalize", status === st ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {st}{st !== "all" && ` (${items.filter((i) => i.status === st).length})`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                {cfg.columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold whitespace-nowrap">{c.label ?? ""}</th>)}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={99} className="py-16 text-center text-slate-400"><LoaderCircle className="mx-auto animate-spin" /></td></tr>
              ) : shown.length === 0 ? (
                <tr><td colSpan={99} className="py-16 text-center text-slate-400">No records found</td></tr>
              ) : (
                shown.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60">
                    {cfg.columns.map((c) => <td key={c.key} className="px-4 py-3 align-middle"><Cell col={c} item={item} /></td>)}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {(cfg.actions || []).filter((a) => !a.show || a.show(item)).map((a) => (
                          <button key={a.label} onClick={() => quick(item, a.set)}
                            className={cn("rounded-lg px-2.5 py-1.5 text-xs font-semibold", a.tone === "red" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}>
                            {a.label}
                          </button>
                        ))}
                        {cfg.viewUrl && <a href={cfg.viewUrl(item)} target="_blank" rel="noreferrer" className="icon-btn" title="View"><ExternalLink size={15} /></a>}
                        <button onClick={() => open(item)} className="icon-btn" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => remove(item)} className="icon-btn hover:bg-rose-50 hover:text-rose-600" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-3xl flex-col bg-paper shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-line bg-white px-6 py-4">
              <h2 className="text-lg font-bold">{editing._id ? "Edit" : "New"} {cfg.singular.toLowerCase()}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(null)} disabled={saving} className="btn btn-ghost">Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary">{saving && <LoaderCircle size={16} className="animate-spin" />}Save</button>
              </div>
            </div>
            {error && <p className="mx-6 mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
            <div className="flex-1 overflow-y-auto p-6">
              <FormFields fields={cfg.fields} value={editing} onChange={setEditing} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
