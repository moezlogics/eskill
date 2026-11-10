"use client";
import { useEffect, useState } from "react";
import { Upload, LoaderCircle, ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import { cn, uploadFile } from "@/lib/utils";

export const labelOf = (f) =>
  f.label ?? f.name.charAt(0).toUpperCase() + f.name.slice(1).replace(/([A-Z])/g, " $1").toLowerCase();

export function emptyValue(fields = []) {
  const v = {};
  for (const f of fields) {
    if (!f.name) continue;
    v[f.name] = f.default ?? (["repeater", "lines"].includes(f.type) || f.multiple ? [] : f.type === "boolean" ? false : "");
  }
  return v;
}

const relCache = {};
export const clearRelationCache = (key) => { delete relCache[key]; };

export function FormFields({ fields, value = {}, onChange }) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f, i) =>
        f.type === "heading" ? (
          <h3 key={`h${i}`} className="mt-3 border-b border-slate-200 pb-2 text-[15px] font-bold text-brand-700 sm:col-span-2">{f.label}</h3>
        ) : (
          <Field key={f.name} field={f} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
        )
      )}
    </div>
  );
}

function Field({ field: f, value, onChange }) {
  const wide = f.full || ["textarea", "lines", "repeater"].includes(f.type) || (f.type === "relation" && f.multiple);
  let input;
  switch (f.type) {
    case "textarea":
      input = <textarea className="input" rows={f.rows || 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "lines":
      input = <textarea className="input" rows={5} value={(value || []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} />;
      break;
    case "number":
      input = <input type="number" className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
      break;
    case "date":
      input = <input type="date" className="input" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "password":
      input = <input type="password" autoComplete="new-password" className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "boolean":
      input = (
        <label className="flex h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-brand-600" />
          <span className="text-sm text-ink">{f.help || "Enabled"}</span>
        </label>
      );
      break;
    case "select":
      input = (
        <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select —</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      break;
    case "image":
      input = <ImageInput value={value} onChange={onChange} />;
      break;
    case "relation":
      input = <RelationInput field={f} value={value} onChange={onChange} />;
      break;
    case "repeater":
      input = <Repeater field={f} value={value} onChange={onChange} />;
      break;
    default:
      input = <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <label className="label">{labelOf(f)}{f.required && <span className="text-rose-500"> *</span>}</label>
      {input}
      {f.help && f.type !== "boolean" && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
    </div>
  );
}

function ImageInput({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadFile(file)); } catch (err) { alert(err.message); }
    setBusy(false);
    e.target.value = "";
  }
  return (
    <div className="flex items-center gap-3">
      <div className="h-[52px] w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {value && <img src={value} alt="" className="h-full w-full object-cover" />}
      </div>
      <input className="input" placeholder="/template/... or https://..." value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <label className="grid h-[52px] w-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-ink/20 text-ink transition hover:bg-paper" title="Upload image">
        {busy ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
        <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
      </label>
    </div>
  );
}

function RelationInput({ field: f, value, onChange }) {
  const [opts, setOpts] = useState(relCache[f.resource] || []);
  useEffect(() => {
    if (relCache[f.resource]) return;
    fetch(`/api/admin/content/${f.resource}?limit=2000&fields=${f.labelKey}`)
      .then((r) => r.json())
      .then((d) => { relCache[f.resource] = d.items || []; setOpts(relCache[f.resource]); });
  }, [f.resource, f.labelKey]);
  const idOf = (v) => (v && typeof v === "object" ? v._id : v) || "";

  if (f.multiple) {
    const selected = (value || []).map(idOf);
    return (
      <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-ink/15 bg-white p-3">
        {opts.map((o) => {
          const on = selected.includes(o._id);
          return (
            <button type="button" key={o._id} onClick={() => onChange(on ? selected.filter((x) => x !== o._id) : [...selected, o._id])}
              className={cn("rounded-full border px-3 py-1 text-sm transition", on ? "border-ink bg-ink text-paper" : "border-slate-200 hover:border-ink")}>
              {o[f.labelKey]}
            </button>
          );
        })}
        {!opts.length && <span className="text-sm text-slate-400">No items yet — add some first.</span>}
      </div>
    );
  }
  return (
    <select className="input" value={idOf(value)} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Select —</option>
      {opts.map((o) => <option key={o._id} value={o._id}>{o[f.labelKey]}</option>)}
    </select>
  );
}

function Repeater({ field: f, value, onChange }) {
  const list = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(list.length === 1 ? 0 : -1);
  const update = (i, v) => onChange(list.map((x, j) => (j === i ? v : x)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
    setOpen(j);
  };
  const remove = (i) => {
    if (!confirm("Remove this item?")) return;
    onChange(list.filter((_, j) => j !== i));
    setOpen(-1);
  };

  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={item._id || `new-${i}`} className={cn("rounded-xl border bg-white", open === i ? "border-ink/40 shadow-sm" : "border-slate-200")}>
          <div className="flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex-1 truncate py-1 text-left text-sm font-semibold text-ink">
              <span className="mr-2 text-slate-400">{i + 1}.</span>
              {(f.itemLabel && item[f.itemLabel]) || "Untitled"}
              {f.countOf && <span className="ml-2 text-xs font-normal text-slate-400">({(item[f.countOf] || []).length})</span>}
            </button>
            <button type="button" className="icon-btn" onClick={() => move(i, -1)} title="Move up"><ChevronUp size={15} /></button>
            <button type="button" className="icon-btn" onClick={() => move(i, 1)} title="Move down"><ChevronDown size={15} /></button>
            <button type="button" className="icon-btn hover:text-rose-600" onClick={() => remove(i)} title="Remove"><X size={15} /></button>
          </div>
          {open === i && (
            <div className="border-t border-slate-200 p-4">
              <FormFields fields={f.fields} value={item} onChange={(v) => update(i, v)} />
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => { onChange([...list, emptyValue(f.fields)]); setOpen(list.length); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-500 transition hover:border-ink hover:text-ink">
        <Plus size={16} />Add {f.addLabel || "item"}
      </button>
    </div>
  );
}
