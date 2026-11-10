"use client";
import { useEffect, useState } from "react";
import { LoaderCircle, CircleCheck } from "lucide-react";
import { FormFields } from "./Form";
import { SETTINGS_FIELDS } from "@/lib/resources";
import { cn } from "@/lib/utils";

// Split fields into tabs at every { type: "tab" } marker
const TABS = SETTINGS_FIELDS.reduce((acc, f) => {
  if (f.type === "tab") acc.push({ label: f.label, fields: [] });
  else (acc.at(-1) || acc[acc.push({ label: "General", fields: [] }) - 1]).fields.push(f);
  return acc;
}, []);

export default function SettingsForm() {
  const [value, setValue] = useState(null);
  const [state, setState] = useState("");
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setValue(d.settings || {}));
  }, []);

  async function save() {
    setState("saving");
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
    setState(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setState(""), 2500);
  }

  if (!value) return <div className="grid place-items-center py-24 text-muted"><LoaderCircle className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Website settings</h1>
        <p className="text-[15px] text-muted">Every text, heading, contact detail and SEO tag on the website.</p>
      </div>
      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", tab === i ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-line hover:ring-ink")}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-[20px] border border-line bg-white p-6 sm:p-8">
        <FormFields fields={TABS[tab].fields} value={value} onChange={setValue} />
      </div>
      <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-4 border-t border-slate-200 bg-slate-50/95 py-4 backdrop-blur">
        {state === "saved" && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600"><CircleCheck size={16} />Saved</span>}
        {state === "error" && <span className="text-sm text-rose-600">Save failed — please try again</span>}
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary">
          {state === "saving" && <LoaderCircle size={16} className="animate-spin" />}Save settings
        </button>
      </div>
    </div>
  );
}
