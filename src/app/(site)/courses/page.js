import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Course, Category } from "@/models";
import { plain, cn, escapeRegex } from "@/lib/utils";
import CourseCard from "@/components/site/CourseCard";
import { Kicker, Mark, EmptyState } from "@/components/site/ui";

export const metadata = { title: "Programs" };

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const MODES = ["On-Campus", "Hybrid", "Live Online"];

export default async function CoursesPage({ searchParams }) {
  const raw = await searchParams;
  const sp = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(Array.isArray(v) ? v[0] : v || "")]));
  await connectDB();

  const cats = plain(await Category.find().sort({ order: 1, name: 1 }).lean());
  const active = cats.find((c) => c.slug === sp.category);
  const filter = { published: true };
  if (active) filter.category = active._id;
  if (sp.level) filter.level = sp.level;
  if (sp.mode) filter.mode = sp.mode;
  if (sp.q) {
    const rx = { $regex: escapeRegex(sp.q), $options: "i" };
    filter.$or = [{ title: rx }, { subtitle: rx }];
  }
  const courses = plain(await Course.find(filter).sort({ order: 1, createdAt: 1 })
    .select("-description -sections.lessons.content").populate("category", "name").lean());

  const qs = (patch) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: sp.q, level: sp.level, mode: sp.mode, category: sp.category, ...patch })) if (v) p.set(k, v);
    const str = p.toString();
    return str ? `/courses?${str}` : "/courses";
  };
  const hasFilters = sp.q || sp.level || sp.mode || sp.category;
  const tab = (on) => cn("shrink-0 border-b-2 pb-4 text-[17px] font-semibold transition", on ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink");

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x pt-14 sm:pt-20">
          <Kicker>{courses.length} program{courses.length === 1 ? "" : "s"} available</Kicker>
          <h1 className="display-page mt-5 max-w-4xl">
            {active ? active.name : <>Find the program <Mark>that fits you.</Mark></>}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">
            {active?.description || "On-campus, project-based programs in search, marketing, AI and web — each with its own detailed curriculum, schedule and projects."}
          </p>
          <nav className="no-scrollbar mt-12 -mb-px flex gap-8 overflow-x-auto">
            <Link href={qs({ category: "" })} className={tab(!active)}>All programs</Link>
            {cats.map((c) => <Link key={c._id} href={qs({ category: c.slug })} className={tab(active?._id === c._id)}>{c.name}</Link>)}
          </nav>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <form action="/courses" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px_auto]">
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <input name="q" defaultValue={sp.q} placeholder="Search a skill, tool or course…" className="input" />
            <select name="level" defaultValue={sp.level} className="input">
              <option value="">Any level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select name="mode" defaultValue={sp.mode} className="input">
              <option value="">Any format</option>
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex gap-2">
              <button className="btn btn-dark flex-1">Filter</button>
              {hasFilters && <Link href="/courses" className="btn btn-outline">Reset</Link>}
            </div>
          </form>

          {courses.length && !hasFilters ? (
            <div className="mt-16 space-y-24">
              {cats.map((t) => ({ ...t, list: courses.filter((c) => c.category?._id === t._id) })).filter((t) => t.list.length).map((t, i) => (
                <div key={t._id}>
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-6">
                    <div>
                      <p className="font-serif text-2xl text-brand-600 italic">{String(i + 1).padStart(2, "0")}</p>
                      <h2 className="display-2 mt-1">{t.name}</h2>
                    </div>
                    {t.description && <p className="max-w-md text-[16px] text-muted">{t.description}</p>}
                  </div>
                  <div className="mt-10 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                    {t.list.map((c) => <CourseCard key={c._id} course={c} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length ? (
            <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>
          ) : (
            <div className="mt-14">
              <EmptyState title="Nothing matches that search" text="Try a different keyword, or clear the filters.">
                <Link href="/courses" className="btn btn-dark">See all programs</Link>
              </EmptyState>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
