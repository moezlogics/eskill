import Link from "next/link";
import { Star, ArrowUpRight, Plus, Clock, Check, Search, MapPin, Sparkles, MessageCircle, Zap } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";

/* ---------- Hand-drawn accents ---------- */
export function Scribble({ className = "" }) {
  return (
    <svg viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path d="M3 15 C 55 5, 105 21, 160 11 S 262 4, 317 14" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function HandArrow({ className = "" }) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 70 C 20 30, 55 12, 104 18" />
      <path d="M88 6 L 106 18 L 90 32" />
    </svg>
  );
}

/* Title + optional highlighted words, from a settings section */
export function TitleMark({ t, color }) {
  return <>{t.title}{t.highlight && <>{t.title ? " " : ""}<Mark color={color}>{t.highlight}</Mark></>}</>;
}

/* Serif italic words with a hand-drawn underline (repeats under every wrapped line) */
const MARK_COLORS = { "text-brand-600": "#f2511b", "text-accent-500": "#ffc83d" };
const scribbleBg = (hex) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 24' preserveAspectRatio='none'><path d='M3 15 C 55 5, 105 21, 160 11 S 262 4, 317 14' fill='none' stroke='${hex}' stroke-width='5' stroke-linecap='round'/></svg>`
  )}")`;

export function Mark({ children, color = "text-brand-600" }) {
  return (
    <span
      className="font-serif font-normal tracking-normal italic"
      style={{
        backgroundImage: scribbleBg(MARK_COLORS[color] || "#f2511b"),
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 0.24em",
        backgroundPosition: "0 96%",
        paddingBottom: "0.06em",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

export function Kicker({ children, light = false, className = "" }) {
  return (
    <p className={cn("flex items-center gap-2.5 text-[15px] font-semibold", light ? "text-paper/80" : "text-ink/70", className)}>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
      {children}
    </p>
  );
}

/* Editorial section header: title left, text + action right */
export function SectionHead({ kicker, title, text, action, light = false }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        {kicker && <Kicker light={light}>{kicker}</Kicker>}
        <h2 className={cn("display-2 mt-4", light && "text-paper")}>{title}</h2>
      </div>
      {(text || action) && (
        <div className="lg:col-span-5 lg:pb-2">
          {text && <p className={cn("text-lg leading-relaxed", light ? "text-paper/70" : "text-muted")}>{text}</p>}
          {action && <div className={cn(text && "mt-6")}>{action}</div>}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, text, center = false, light = false }) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow && <Kicker light={light} className={center ? "justify-center" : ""}>{eyebrow}</Kicker>}
      <h2 className={cn("display-2 mt-4", light && "text-paper")}>{title}</h2>
      {text && <p className={cn("mt-5 text-lg leading-relaxed", light ? "text-paper/70" : "text-muted")}>{text}</p>}
    </div>
  );
}

export function Stars({ value = 5, size = 15 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-brand-600">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-current" : "text-ink/20"} />
      ))}
    </span>
  );
}

/* Image, or a designed "poster" fallback with the title in big type */
const SWATCHES = ["bg-forest text-paper", "bg-ink text-paper", "bg-brand-600 text-white", "bg-accent-500 text-ink", "bg-paper-2 text-ink"];
const swatch = (s = "") => SWATCHES[[...String(s)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % SWATCHES.length];

export function Thumb({ src, alt = "", className = "" }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
  return (
    <div className={cn("@container relative flex flex-col justify-between overflow-hidden", swatch(alt), className)}>
      <span aria-hidden="true" className="self-end p-[6cqw] text-[10cqw] leading-none opacity-70">✺</span>
      <span className="line-clamp-3 p-[7cqw] pt-0 text-[8.5cqw] leading-[0.98] font-extrabold tracking-[-0.03em]">{alt}</span>
    </div>
  );
}

const initials = (name = "") => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

export function Avatar({ src, name = "", className = "h-12 w-12" }) {
  if (src) return <img src={src} alt={name} className={cn("rounded-full object-cover", className)} />;
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-paper-2 font-bold text-ink", className)}>
      {initials(name)}
    </div>
  );
}

export function PageHero({ eyebrow, title, text }) {
  return (
    <section className="border-b border-line">
      <div className="container-x pt-16 pb-14 sm:pt-24 sm:pb-20">
        {eyebrow && <Kicker>{eyebrow}</Kicker>}
        <h1 className="display-page mt-5 max-w-5xl">{title}</h1>
        {text && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">{text}</p>}
      </div>
    </section>
  );
}

export function Faqs({ items = [] }) {
  return (
    <div className="border-t border-ink/15">
      {items.map((f, i) => (
        <details key={f._id || i} open={i === 0} className="group border-b border-ink/15">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-lg font-semibold text-ink sm:text-xl [&::-webkit-details-marker]:hidden">
            <span>{f.question}</span>
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 transition group-open:rotate-45 group-open:border-brand-600 group-open:bg-brand-600 group-open:text-white">
              <Plus size={18} />
            </span>
          </summary>
          <div className="max-w-3xl pb-7 text-[17px] leading-relaxed whitespace-pre-line text-muted">{f.answer}</div>
        </details>
      ))}
    </div>
  );
}

/* Simple text renderer: "## heading", "- bullet", blank line = new paragraph */
export function Prose({ text = "", className = "" }) {
  const out = [];
  let para = [];
  let list = null;
  const flushPara = () => { if (para.length) { out.push(<p key={out.length}>{para.join(" ")}</p>); para = []; } };
  const flushList = () => { if (list) { out.push(<ul key={out.length}>{list.map((li, i) => <li key={i}>{li}</li>)}</ul>); list = null; } };

  for (const raw of String(text || "").split("\n")) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); }
    else if (line.startsWith("### ")) { flushPara(); flushList(); out.push(<h3 key={out.length}>{line.slice(4)}</h3>); }
    else if (line.startsWith("## ")) { flushPara(); flushList(); out.push(<h2 key={out.length}>{line.slice(3)}</h2>); }
    else if (/^[-*•]\s+/.test(line)) { flushPara(); (list ||= []).push(line.replace(/^[-*•]\s+/, "")); }
    else { flushList(); para.push(line); }
  }
  flushPara();
  flushList();
  return <div className={cn("prose-lite", className)}>{out}</div>;
}

export function StatsBand({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <section className="bg-ink text-paper">
      <div className="container-x grid grid-cols-2 gap-x-8 gap-y-10 py-16 md:grid-cols-4 md:py-20">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-paper/20 pt-6">
            <p className="text-[clamp(36px,4.6vw,68px)] leading-none font-extrabold tracking-[-0.04em]">{s.value}</p>
            <p className="mt-3 text-base text-paper/70">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MentorCard({ m }) {
  return (
    <article className="group">
      <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-paper-2">
        {m.photo ? (
          <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full place-items-center font-serif text-7xl text-ink/25 italic">{initials(m.name)}</div>
        )}
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight">{m.name}</h3>
      <p className="mt-1 text-[15px] font-medium text-brand-700">{[m.designation, m.company].filter(Boolean).join(" · ")}</p>
      {m.bio && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted">{m.bio}</p>}
      {m.linkedin && (
        <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-flex items-center gap-1 text-sm font-semibold">
          LinkedIn <ArrowUpRight size={14} />
        </a>
      )}
    </article>
  );
}

export function TestimonialCard({ t }) {
  return (
    <figure className="flex h-full flex-col rounded-[20px] border border-line bg-white p-7 sm:p-8">
      <span className="font-serif text-6xl leading-none text-brand-600">“</span>
      <blockquote className="mt-1 flex-1 text-lg leading-relaxed text-ink">{t.text}</blockquote>
      <figcaption className="mt-8 flex items-center gap-4">
        <Avatar src={t.photo} name={t.name} />
        <div className="min-w-0">
          <p className="font-bold">{t.name}</p>
          <p className="truncate text-sm text-muted">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
        </div>
        {t.rating > 0 && <span className="ml-auto"><Stars value={t.rating} size={14} /></span>}
      </figcaption>
    </figure>
  );
}

export function EventCard({ e }) {
  const d = e.date ? new Date(e.date) : null;
  return (
    <article className="flex h-full flex-col rounded-[20px] border border-line bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        {d ? (
          <div>
            <p className="font-serif text-6xl leading-none italic">{d.getUTCDate()}</p>
            <p className="mt-2 text-[15px] font-semibold text-muted">
              {d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            </p>
          </div>
        ) : <span />}
        {e.isFree && <span className="tag bg-accent-500 text-ink">Free</span>}
      </div>
      {e.image && <img src={e.image} alt={e.title} loading="lazy" className="mt-6 aspect-video w-full rounded-xl object-cover" />}
      <h3 className="mt-6 text-2xl leading-tight font-extrabold tracking-tight">{e.title}</h3>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted">
        {e.time && <span className="flex items-center gap-1.5"><Clock size={15} />{e.time}</span>}
        {e.speaker && <span>with {e.speaker}</span>}
      </p>
      {e.description && <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-muted">{e.description}</p>}
      <div className="mt-auto pt-7">
        {e.link
          ? <a href={e.link} target="_blank" rel="noopener noreferrer" className="btn btn-dark w-full">Join / register</a>
          : <a href="/events#register" className="btn btn-outline w-full">Save my seat</a>}
      </div>
    </article>
  );
}

export function PostCard({ p }) {
  return (
    <Link href={`/blog/${p.slug}`} className="group flex flex-col">
      <div className="overflow-hidden rounded-[20px]">
        <Thumb src={p.cover} alt={p.title} className="aspect-[16/10] w-full transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <p className="mt-5 text-[15px] text-muted">{[p.author, fmtDate(p.createdAt)].filter(Boolean).join(" · ")}</p>
      <h3 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight decoration-2 underline-offset-4 group-hover:underline">{p.title}</h3>
      {p.excerpt && <p className="mt-3 line-clamp-2 text-[16px] leading-relaxed text-muted">{p.excerpt}</p>}
    </Link>
  );
}

export function AuthShell({ title, text, children }) {
  const perks = ["All your courses in one place", "Track every lesson you finish", "Download verified certificates", "Hear about new batches first"];
  return (
    <section>
      <div className="container-x grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-[28px] bg-forest p-12 text-paper lg:flex">
          <p className="text-lg font-semibold text-paper/70">Student portal</p>
          <div>
            <p className="font-serif text-5xl leading-[1.08] italic">Your classes, projects and certificates — in one place.</p>
            <ul className="mt-10 space-y-3 text-lg text-paper/80">
              {perks.map((p) => <li key={p} className="flex items-center gap-3"><Check size={20} className="text-accent-500" />{p}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-full max-w-md lg:mx-auto">
            <h1 className="text-[clamp(36px,4vw,52px)] leading-none font-extrabold tracking-[-0.035em]">{title}</h1>
            <p className="mt-3 text-lg text-muted">{text}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="rounded-[20px] border-2 border-dashed border-line px-6 py-16 text-center">
      <h3 className="text-2xl font-extrabold tracking-tight">{title}</h3>
      {text && <p className="mt-2 text-lg text-muted">{text}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

const STATUS = {
  pending: "bg-amber-100 text-amber-800", approved: "bg-emerald-100 text-emerald-800", rejected: "bg-rose-100 text-rose-700",
  new: "bg-sky-100 text-sky-800", contacted: "bg-amber-100 text-amber-800", interested: "bg-violet-100 text-violet-800",
  converted: "bg-emerald-100 text-emerald-800", closed: "bg-slate-200 text-slate-700",
};
export function StatusBadge({ status }) {
  return <span className={cn("tag capitalize", STATUS[status] || "bg-paper-2 text-ink")}>{status}</span>;
}

/* ---------- Designed program cover (used when no cover image is set) ---------- */
const TRACKS = [
  { bg: "bg-forest", fg: "text-paper", accent: "text-accent-500" },
  { bg: "bg-brand-600", fg: "text-white", accent: "text-ink" },
  { bg: "bg-ink", fg: "text-paper", accent: "text-brand-500" },
  { bg: "bg-accent-500", fg: "text-ink", accent: "text-brand-700" },
];
const trackOf = (key = "") => TRACKS[[...String(key)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % TRACKS.length];

export function ProgramCover({ course: c, className = "", showTitle = true }) {
  if (c.thumbnail) return <img src={c.thumbnail} alt={c.title} loading="lazy" className={cn("object-cover", className)} />;
  const st = trackOf(c.category?.name || c.title);
  const label = (c.coverLabel || c.title.split(" ").map((w) => w[0]).join("").slice(0, 4)).toUpperCase();
  return (
    <div className={cn("@container relative flex flex-col justify-between overflow-hidden", st.bg, st.fg, className)}>
      <div className="flex items-start justify-between p-[6cqw] text-[4.2cqw] font-semibold">
        <span className="opacity-80">{c.category?.name || "Program"}</span>
        <span aria-hidden="true" className={cn("text-[9cqw] leading-none", st.accent)}>✺</span>
      </div>
      <p aria-hidden="true" className="px-[5cqw] leading-[0.82] font-extrabold tracking-[-0.06em]" style={{ fontSize: `${Math.min(30, 135 / Math.max(label.length, 2))}cqw` }}>
        {label}
      </p>
      {showTitle ? <p className="line-clamp-2 p-[6cqw] pt-[3cqw] text-[5cqw] leading-tight font-semibold">{c.title}</p> : <span className="p-[4cqw]" />}
    </div>
  );
}

/* ---------- Hero visual: what students learn, at a glance ---------- */
export function HeroBoard() {
  return (
    <div className="relative h-full overflow-hidden rounded-[28px] bg-forest px-5 pt-20 pb-24 sm:px-7 lg:px-7 lg:pt-16 lg:pb-7">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full border-[40px] border-paper/5" aria-hidden="true" />

      {/* Local SEO: Google Maps result */}
      <div className="relative rounded-2xl bg-white p-4 text-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] sm:p-5">
        <div className="flex items-center gap-2.5 rounded-full border border-ink/15 px-4 py-2.5 text-[14px] sm:text-[15px]">
          <Search size={16} className="shrink-0 text-muted" /> best biryani near me
        </div>
        <div className="mt-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><MapPin size={18} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">Local Restaurant</p>
            <p className="text-[13px] text-muted"><span className="text-brand-600">★★★★★</span> 4.8 · Open now · 1.2 km</p>
          </div>
          <span className="tag shrink-0 bg-accent-500 px-2.5 py-1 text-[12px] text-ink">#1 on Maps</span>
        </div>
        <p className="mt-3 text-[12px] font-semibold text-forest">Local SEO</p>
      </div>

      {/* GEO / AEO: cited in AI answers */}
      <div className="relative mt-4 ml-6 -rotate-1 rounded-2xl bg-ink p-4 text-paper sm:ml-10 sm:p-5">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-accent-500"><Sparkles size={15} /> AI answer</p>
        <p className="mt-2 text-[14px] leading-relaxed text-paper/85 sm:text-[15px]">Top-rated clinics in your area include…</p>
        <div className="mt-2 space-y-1.5" aria-hidden="true">
          <div className="h-2 w-11/12 rounded-full bg-paper/15" />
          <div className="h-2 w-8/12 rounded-full bg-paper/15" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="rounded-full bg-paper/10 px-2.5 py-1">Source: yourclient.pk</span>
          <span className="font-semibold text-accent-500">GEO · AEO</span>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-4">
        {/* Meta ads */}
        <div className="rotate-1 rounded-2xl bg-accent-500 p-4 text-ink">
          <p className="text-[12px] font-semibold">Meta Ads</p>
          <div className="mt-3 flex h-14 items-end gap-1.5" aria-hidden="true">
            {[35, 50, 42, 68, 80, 100].map((h, i) => <span key={i} className="flex-1 rounded-sm bg-ink" style={{ height: `${h}%` }} />)}
          </div>
          <p className="mt-2 text-[13px] font-bold">More leads, same budget</p>
        </div>
        {/* AI automation */}
        <div className="rounded-2xl bg-paper p-4 text-ink">
          <p className="text-[12px] font-semibold">AI Automation</p>
          <div className="mt-3 space-y-2 text-[12px] font-semibold">
            <p className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-paper"><Zap size={12} /></span>New lead</p>
            <p className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white"><Sparkles size={12} /></span>AI replies</p>
            <p className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle size={12} /></span>WhatsApp ✓</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Placeholder panel where a real photo should go ---------- */
export function PhotoOr({ src, alt = "", className = "", title, lines = [] }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
  return (
    <div className={cn("@container relative flex flex-col justify-between overflow-hidden bg-forest p-[8cqw] text-paper", className)}>
      <span aria-hidden="true" className="text-[12cqw] leading-none text-accent-500">✺</span>
      <div>
        {title && <p className="font-serif text-[9cqw] leading-[1.05] italic">{title}</p>}
        {lines.length > 0 && (
          <ul className="mt-[5cqw] space-y-[2cqw] text-[4.2cqw] text-paper/80">
            {lines.map((l) => <li key={l} className="flex gap-[2cqw]"><Check className="mt-[0.6cqw] h-[4.5cqw] w-[4.5cqw] shrink-0 text-accent-500" />{l}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
