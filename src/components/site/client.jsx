"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, CircleCheck, Upload, LogOut, Printer } from "lucide-react";
import { cn, formatPrice, uploadFile } from "@/lib/utils";

async function post(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}
const Spinner = () => <LoaderCircle size={18} className="animate-spin" />;
const safeNext = (n) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "");

/* ---------- Lead / callback / counselling form ---------- */
export const TIMINGS = ["Morning (10 AM – 1 PM)", "Afternoon (2 PM – 5 PM)", "Evening (6 PM – 9 PM)", "Weekend"];

export function LeadForm({ source = "website", options = [], course = "", title, subtitle, cta = "Request a callback", showMessage = false, showTiming = false, showCity = false, dark = false, timings }) {
  const timingOptions = timings?.length ? timings : TIMINGS;
  const [state, setState] = useState({ loading: false, done: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState({ loading: true, done: false, error: "" });
    try {
      await post("/api/leads", { ...data, source });
      form.reset();
      setState({ loading: false, done: true, error: "" });
    } catch (err) {
      setState({ loading: false, done: false, error: err.message });
    }
  }

  if (state.done)
    return (
      <div className={cn("rounded-2xl p-8 text-center", dark ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-800")}>
        <CircleCheck className="mx-auto mb-3" size={44} />
        <h3 className="text-xl font-bold">Thank you!</h3>
        <p className="mt-1 opacity-80">Our admission advisor will contact you shortly.</p>
        <button onClick={() => setState({ loading: false, done: false, error: "" })} className="mt-4 text-sm font-semibold underline">Submit another</button>
      </div>
    );

  const input = cn("input", dark && "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white");
  return (
    <form onSubmit={submit} className="space-y-3">
      {title && (
        <div className="mb-4">
          <h3 className={cn("text-2xl font-extrabold tracking-tight", dark ? "text-white" : "text-ink")}>{title}</h3>
          {subtitle && <p className={cn("mt-2 text-[15px] leading-relaxed", dark ? "text-white/70" : "text-muted")}>{subtitle}</p>}
        </div>
      )}
      <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      {course && <input type="hidden" name="course" value={course} />}
      <input name="name" required placeholder="Full name *" className={input} />
      <input name="phone" required type="tel" placeholder="Phone / WhatsApp *" className={input} />
      <input name="email" type="email" placeholder="Email (optional)" className={input} />
      {!course && options.length > 0 && (
        <select name="course" defaultValue="" className={input}>
          <option value="" disabled>Interested in…</option>
          {options.map((o) => <option key={o} value={o} className="text-ink">{o}</option>)}
        </select>
      )}
      {(showTiming || showCity) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {showTiming && (
            <select name="preferredTime" defaultValue="" className={cn(input, !showCity && "sm:col-span-2")}>
              <option value="" disabled>Preferred timing…</option>
              {timingOptions.map((t) => <option key={t} value={t} className="text-ink">{t}</option>)}
            </select>
          )}
          {showCity && <input name="city" placeholder="City / area" className={cn(input, !showTiming && "sm:col-span-2")} />}
        </div>
      )}
      {showMessage && <textarea name="message" rows={4} placeholder="Your message" className={input} />}
      {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
      <button disabled={state.loading} className="btn btn-primary w-full">{state.loading && <Spinner />}{cta}</button>
      <p className={cn("text-center text-xs", dark ? "text-white/50" : "text-ink/45")}>We respect your privacy. No spam.</p>
    </form>
  );
}

/* ---------- Login / Register ---------- */
export function AuthForm({ mode = "login", next = "" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setLoading(true);
    setError("");
    try {
      const res = await post(`/api/auth/${mode}`, data);
      router.push(safeNext(next) || (res.role === "admin" ? "/admin" : "/dashboard"));
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && <div><label className="label">Full name</label><input name="name" required className="input" /></div>}
      <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
      {mode === "register" && <div><label className="label">Phone / WhatsApp</label><input name="phone" type="tel" className="input" /></div>}
      <div><label className="label">Password</label><input name="password" type="password" required minLength={6} className="input" /></div>
      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
      <button disabled={loading} className="btn btn-primary btn-lg w-full">{loading && <Spinner />}{mode === "login" ? "Log in" : "Create account"}</button>
      <p className="text-center text-[15px] text-muted">
        {mode === "login" ? (
          <>New here? <Link href={`/register${qs}`} className="link-u font-semibold text-ink">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={`/login${qs}`} className="link-u font-semibold text-ink">Log in</Link></>
        )}
      </p>
    </form>
  );
}

/* ---------- Checkout (manual payment) ---------- */
export function CheckoutForm({ courseId, amount, pay = {}, defaultPhone = "" }) {
  const methods = [
    { name: "Bank Transfer", rows: [["Bank", pay.bankName], ["Account title", pay.accountTitle], ["Account number", pay.accountNumber], ["IBAN", pay.iban]] },
    { name: "JazzCash", rows: [["Account title", pay.accountTitle], ["JazzCash number", pay.jazzcash]] },
    { name: "Easypaisa", rows: [["Account title", pay.accountTitle], ["Easypaisa number", pay.easypaisa]] },
  ];
  const [method, setMethod] = useState(methods[0].name);
  const [shot, setShot] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const rows = methods.find((m) => m.name === method).rows.filter((r) => r[1]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try { setShot(await uploadFile(file)); } catch (err) { setError(err.message); }
    setUploading(false);
  }

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setLoading(true);
    setError("");
    try {
      await post("/api/orders", { ...data, courseId, method, screenshot: shot });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  if (done)
    return (
      <div className="rounded-[24px] border border-line bg-white p-8 sm:p-10">
        <CircleCheck className="text-emerald-600" size={52} />
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight">Payment submitted!</h2>
        <p className="mt-3 text-lg text-muted">We are verifying your payment. The course will unlock in your dashboard as soon as it is approved.</p>
        <Link href="/dashboard" className="btn btn-dark mt-8">Go to dashboard</Link>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-[24px] border border-line bg-white p-6 sm:p-8">
        <h2 className="text-xl font-extrabold tracking-tight"><span className="mr-2 font-serif text-brand-600 italic">1</span>Choose how you pay</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {methods.map((m) => (
            <button type="button" key={m.name} onClick={() => setMethod(m.name)}
              className={cn("rounded-xl border-2 p-4 text-left font-semibold transition", method === m.name ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>
              {m.name}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-paper p-5">
          <p className="text-[15px] text-muted">Send <b className="text-ink">{formatPrice(amount)}</b> to:</p>
          {rows.length ? (
            <dl className="mt-3 grid gap-2 text-[15px]">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-2">
                  <dt className="text-muted">{k}</dt><dd className="font-semibold text-ink select-all">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-[15px]">Account details will be shared by our team on WhatsApp{pay.phone ? ` (${pay.phone})` : ""}.</p>
          )}
          {pay.paymentNote && <p className="mt-4 text-[13px] text-muted">{pay.paymentNote}</p>}
        </div>
      </div>

      <div className="space-y-4 rounded-[24px] border border-line bg-white p-6 sm:p-8">
        <h2 className="text-xl font-extrabold tracking-tight"><span className="mr-2 font-serif text-brand-600 italic">2</span>Confirm your payment</h2>
        <div><label className="label">Transaction ID / reference no. *</label><input name="transactionId" required className="input" /></div>
        <div><label className="label">Phone / WhatsApp *</label><input name="phone" required defaultValue={defaultPhone} className="input" /></div>
        <div>
          <label className="label">Payment screenshot</label>
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line p-4 transition hover:border-ink">
            {shot
              ? <img src={shot} alt="" className="h-16 w-16 rounded-lg object-cover" />
              : <span className="grid h-16 w-16 place-items-center rounded-lg bg-paper text-ink">{uploading ? <Spinner /> : <Upload />}</span>}
            <span className="text-[15px] text-muted">{shot ? "Screenshot uploaded — click to change" : "Click to upload (JPG/PNG, max 5MB)"}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onFile} />
          </label>
        </div>
        <div><label className="label">Note (optional)</label><textarea name="note" rows={2} className="input" /></div>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        <button disabled={loading || uploading} className="btn btn-primary btn-lg w-full">{loading && <Spinner />}Submit payment for verification</button>
      </div>
    </form>
  );
}

/* ---------- Small buttons ---------- */
export function FreeEnrollButton({ courseId, slug, className = "btn btn-primary w-full" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function enroll() {
    setLoading(true);
    try {
      await post("/api/orders", { courseId });
      router.push(`/learn/${slug}`);
      router.refresh();
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  }
  return <button onClick={enroll} disabled={loading} className={className}>{loading && <Spinner />}Enroll for free</button>;
}

export function CompleteButton({ courseId, lessonId, done, nextHref }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  if (done) return <span className="btn bg-emerald-50 text-emerald-700"><CircleCheck size={18} />Completed</span>;
  async function mark() {
    setLoading(true);
    try {
      await post("/api/progress", { courseId, lessonId });
      if (nextHref) router.push(nextHref);
      router.refresh();
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  }
  return <button onClick={mark} disabled={loading} className="btn btn-primary">{loading ? <Spinner /> : <CircleCheck size={18} />}Mark as complete</button>;
}

export function LogoutButton({ className = "" }) {
  const router = useRouter();
  async function logout() {
    await post("/api/auth/logout");
    router.push("/");
    router.refresh();
  }
  return <button onClick={logout} className={cn("inline-flex items-center gap-2", className)}><LogOut size={16} />Logout</button>;
}

export function PrintButton() {
  return <button onClick={() => window.print()} className="btn btn-dark print:hidden"><Printer size={18} />Print / Save as PDF</button>;
}
