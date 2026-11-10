import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronDown, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { Course, Testimonial } from "@/models";
import { plain, cn, fmtDate, toEmbed } from "@/lib/utils";
import { Prose, Faqs, MentorCard, TestimonialCard, ProgramCover, Kicker } from "@/components/site/ui";
import CourseCard, { nextBatchOf } from "@/components/site/CourseCard";
import { LeadForm } from "@/components/site/client";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const c = await Course.findOne({ slug }).select("title subtitle thumbnail").lean();
  if (!c) return {};
  return { title: c.title, description: c.subtitle, openGraph: { images: c.thumbnail ? [c.thumbnail] : [] } };
}

function Block({ id, n, title, intro, children }) {
  return (
    <section id={id} className="scroll-mt-40 border-t border-ink pt-8">
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-2xl text-brand-600 italic">{n}</span>
        <h2 className="h2">{title}</h2>
      </div>
      {intro && <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function CoursePage({ params }) {
  const { slug } = await params;
  await connectDB();
  const session = await getSession();
  const raw = await Course.findOne({ slug }).populate("category", "name slug").populate("instructors").lean();
  if (!raw || (!raw.published && session?.role !== "admin")) notFound();
  const c = plain(raw);

  const [s, reviews, related] = await Promise.all([
    getSettings(),
    Testimonial.find({ featured: true }).sort({ order: 1, createdAt: -1 }).limit(2).lean().then(plain),
    Course.find({ published: true, category: c.category?._id, _id: { $ne: c._id } }).sort({ order: 1 }).limit(3)
      .select("-description -sections.lessons.content").populate("category", "name").lean().then(plain),
  ]);

  const sections = c.sections || [];
  const topics = sections.reduce((n, sec) => n + (sec.lessons?.length || 0), 0);
  const nb = nextBatchOf(c);
  const wa = String(s.whatsapp || "").replace(/\D/g, "");

  const facts = [
    ["Duration", c.duration], ["Schedule", c.schedule], ["Class hours", c.liveHours],
    ["Batch size", c.classSize], ["Level", c.level], ["Format", c.mode],
  ].filter(([, v]) => v);

  const tabs = [
    ["overview", "Overview"], c.whoFor?.length && ["who", "Who it's for"], sections.length && ["curriculum", "Curriculum"],
    c.projects?.length && ["projects", "Projects"], c.tools?.length && ["tools", "Tools"],
    c.batches?.length && ["batches", "Batches"], c.careerPaths?.length && ["careers", "Careers"], c.faqs?.length && ["faqs", "FAQs"],
  ].filter(Boolean);

  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <div className="pb-24 lg:pb-0">
      {/* HERO */}
      <section className="border-b border-line">
        <div className="container-x grid gap-12 pt-10 pb-14 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-20">
          <div className="lg:col-span-7">
            <nav className="flex flex-wrap items-center gap-2 text-[15px] text-muted">
              <Link href="/courses" className="link-u">Programs</Link>
              {c.category && <><span>/</span><Link href={`/courses?category=${c.category.slug}`} className="link-u">{c.category.name}</Link></>}
            </nav>
            <h1 className="display-page mt-6">{c.title}</h1>
            {c.subtitle && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink/75">{c.subtitle}</p>}

            {facts.length > 0 && (
              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-t border-ink pt-4">
                    <p className="text-[15px] text-muted">{k}</p>
                    <p className="mt-1 text-lg leading-snug font-extrabold tracking-tight">{v}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#apply" className="btn btn-primary btn-lg">Apply for the next batch <ArrowRight size={18} /></a>
              {s.phone && <a href={`tel:${s.phone}`} className="btn btn-outline btn-lg"><Phone size={18} />Call admissions</a>}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[28px] border border-line bg-white p-4 sm:p-5">
              <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-ink">
                {c.previewVideo
                  ? <iframe src={toEmbed(c.previewVideo)} title="Program intro" className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
                  : <ProgramCover course={c} className="h-full w-full" />}
              </div>
              <div className="p-3 pt-6 sm:p-4 sm:pt-7">
                <p className="text-[15px] text-muted">{nb ? "Next batch starts" : "Next batch"}</p>
                <p className="mt-1 text-[32px] leading-none font-extrabold tracking-[-0.03em]">{nb ? fmtDate(nb.startDate) : "Announcing soon"}</p>
                {nb && (
                  <p className="mt-3 text-[16px] text-muted">
                    {[nb.days, nb.timing].filter(Boolean).join(" · ")}
                    {nb.seatsLeft > 0 && <span className="font-semibold text-brand-700"> — {nb.seatsLeft} seats left</span>}
                  </p>
                )}
                <div className="mt-6 grid gap-3">
                  <a href="#apply" className="btn btn-primary btn-lg w-full">Reserve my seat</a>
                  {wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I'd like details about the ${c.title} program.`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full"><MessageCircle size={18} />Ask on WhatsApp</a>}
                </div>
                {c.highlights?.length > 0 && (
                  <ul className="mt-7 space-y-3 border-t border-line pt-6 text-[16px]">
                    {c.highlights.map((t) => <li key={t} className="flex gap-3"><Check size={20} className="mt-0.5 shrink-0 text-brand-600" />{t}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div className="sticky top-20 z-30 border-b border-line bg-paper/95 backdrop-blur-md print:hidden">
        <div className="container-x flex items-center justify-between gap-6">
          <nav className="no-scrollbar -mb-px flex gap-7 overflow-x-auto">
            {tabs.map(([id, l]) => (
              <a key={id} href={`#${id}`} className="shrink-0 border-b-2 border-transparent py-4 text-[16px] font-semibold text-muted transition hover:border-ink hover:text-ink">{l}</a>
            ))}
          </nav>
          <a href="#apply" className="btn btn-primary hidden shrink-0 py-2.5 lg:inline-flex">Apply now</a>
        </div>
      </div>

      <div className="container-x grid gap-14 py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="min-w-0 space-y-20 lg:col-span-8">
          <Block id="overview" n={num()} title="About this program">
            {c.intro && <p className="text-[clamp(20px,2vw,26px)] leading-[1.45] font-semibold tracking-[-0.01em]">{c.intro}</p>}
            {c.description && <Prose text={c.description} className={c.intro ? "mt-8" : ""} />}
            {c.outcomes?.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-extrabold tracking-tight">By the end, you&apos;ll be able to</h3>
                <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
                  {c.outcomes.map((o) => (
                    <li key={o} className="flex gap-3 border-b border-ink/10 py-4 text-[17px]"><Check size={20} className="mt-0.5 shrink-0 text-brand-600" />{o}</li>
                  ))}
                </ul>
              </div>
            )}
          </Block>

          {c.whoFor?.length > 0 && (
            <Block id="who" n={num()} title="Who this program is for">
              <div className="grid gap-4 sm:grid-cols-2">
                {c.whoFor.map((w, i) => (
                  <div key={w} className="rounded-[20px] border border-line bg-white p-6">
                    <p className="font-serif text-3xl text-brand-600 italic">{i + 1}</p>
                    <p className="mt-3 text-lg leading-snug font-semibold">{w}</p>
                  </div>
                ))}
              </div>
              {c.requirements?.length > 0 && (
                <div className="mt-6 rounded-[20px] bg-paper-2 p-6 sm:p-8">
                  <h3 className="text-xl font-bold">Before you join</h3>
                  <ul className="mt-4 space-y-2 text-[17px] text-ink/80">
                    {c.requirements.map((r) => <li key={r} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />{r}</li>)}
                  </ul>
                </div>
              )}
            </Block>
          )}

          {c.differentiators?.length > 0 && (
            <section className="rounded-[28px] bg-ink p-8 text-paper sm:p-10">
              <Kicker light>What makes this program different</Kicker>
              <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2">
                {c.differentiators.map((d, i) => (
                  <div key={d.title} className="border-t border-paper/20 pt-5">
                    <p className="font-serif text-2xl text-accent-500 italic">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-3 text-xl font-bold tracking-tight">{d.title}</h3>
                    {d.text && <p className="mt-2 text-[16px] leading-relaxed text-paper/70">{d.text}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections.length > 0 && (
            <Block id="curriculum" n={num()} title="Curriculum" intro={`${sections.length} modules · ${topics} topics${c.duration ? ` · ${c.duration}` : ""}`}>
              <div className="border-t border-ink/15">
                {sections.map((sec, i) => (
                  <details key={sec._id} open={i === 0} className="group border-b border-ink/15">
                    <summary className="flex cursor-pointer list-none items-center gap-5 py-6 [&::-webkit-details-marker]:hidden">
                      <span className="w-10 shrink-0 font-serif text-2xl text-muted italic">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1">
                        <span className="block text-xl font-bold tracking-tight">{sec.title}</span>
                        <span className="text-[15px] text-muted">{[sec.weeks, `${sec.lessons?.length || 0} topics`].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/20 transition group-open:rotate-180 group-open:border-ink">
                        <ChevronDown size={18} />
                      </span>
                    </summary>
                    <div className="pb-7 sm:pl-15">
                      {sec.summary && <p className="max-w-2xl text-[16px] leading-relaxed text-muted">{sec.summary}</p>}
                      <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
                        {(sec.lessons || []).map((l) => (
                          <li key={l._id} className="flex gap-3 py-2 text-[16px]"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />{l.title}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </Block>
          )}

          {c.projects?.length > 0 && (
            <Block id="projects" n={num()} title="What you'll build" intro="Every project is done in class with trainer feedback — and goes straight into your portfolio.">
              <div className="grid gap-5 sm:grid-cols-2">
                {c.projects.map((p, i) => (
                  <article key={p._id || i} className="overflow-hidden rounded-[20px] border border-line bg-white">
                    {p.image && <img src={p.image} alt={p.title} loading="lazy" className="aspect-video w-full object-cover" />}
                    <div className="p-6">
                      <p className="text-[15px] font-semibold text-brand-700">Project {String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">{p.title}</h3>
                      {p.description && <p className="mt-2 text-[16px] leading-relaxed text-muted">{p.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </Block>
          )}

          {c.tools?.length > 0 && (
            <Block id="tools" n={num()} title="Tools you'll use">
              <div className="flex flex-wrap gap-3">
                {c.tools.map((t, i) => (
                  <span key={t._id || i} className="inline-flex items-center gap-2.5 rounded-full border border-ink/20 bg-white px-5 py-3 text-[16px] font-semibold">
                    {t.logo && <img src={t.logo} alt="" className="h-6 w-6 object-contain" />}{t.name}
                  </span>
                ))}
              </div>
            </Block>
          )}

          {c.instructors?.length > 0 && (
            <Block id="trainers" n={num()} title="Your trainers">
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
                {c.instructors.map((m) => <MentorCard key={m._id} m={m} />)}
              </div>
            </Block>
          )}

          {c.batches?.length > 0 && (
            <Block id="batches" n={num()} title="Upcoming batches" intro={c.classSize ? `${c.classSize} per batch, so there's time for your questions every class.` : "Small batches, so there's time for your questions every class."}>
              <div className="border-t border-ink/15">
                {c.batches.map((b, i) => (
                  <div key={b._id || i} className="grid items-center gap-4 border-b border-ink/15 py-6 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <p className="text-2xl font-extrabold tracking-tight">{b.startDate ? fmtDate(b.startDate) : "Date to be announced"}</p>
                      <p className="text-[15px] text-muted">Start date</p>
                    </div>
                    <div className="text-[16px] sm:col-span-4">
                      <p className="font-semibold">{b.days || "—"}</p>
                      <p className="text-muted">{b.timing}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-4 sm:justify-end">
                      {b.seatsLeft > 0 && (
                        <span className={cn("tag", b.seatsLeft <= 8 ? "bg-brand-600 text-white" : "bg-paper-2 text-ink")}>{b.seatsLeft} seats left</span>
                      )}
                      <a href="#apply" className="btn btn-dark py-2.5">Apply</a>
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {c.careerPaths?.length > 0 && (
            <Block id="careers" n={num()} title="Where this can take you">
              <div className="flex flex-wrap gap-3">
                {c.careerPaths.map((p) => (
                  <span key={p} className="rounded-full bg-forest px-5 py-3 text-[16px] font-semibold text-paper">{p}</span>
                ))}
              </div>
            </Block>
          )}

          <Block id="certificate" n={num()} title="Certificate">
            <div className="grid items-center gap-8 rounded-[24px] bg-forest p-8 text-paper sm:p-10 md:grid-cols-2">
              <ul className="space-y-4 text-[17px] text-paper/85">
                {["Awarded after your final project is reviewed", "Unique certificate ID for every student", "Anyone can verify it on our website", "Add it to your CV, LinkedIn and Fiverr/Upwork profile"].map((t) => (
                  <li key={t} className="flex gap-3"><Check size={20} className="mt-0.5 shrink-0 text-accent-500" />{t}</li>
                ))}
              </ul>
              <div className="-rotate-2 rounded-2xl border-4 border-double border-ink/80 bg-paper p-6 text-center text-ink shadow-[8px_8px_0_0_#ffc83d]">
                <p className="text-[13px] font-semibold tracking-[0.25em] text-muted uppercase">Certificate of completion</p>
                <p className="mt-4 font-serif text-4xl italic">Your Name</p>
                <p className="mt-3 text-[15px] font-semibold">{c.title}</p>
                <div className="mt-5 h-px bg-ink/20" />
                <p className="mt-3 text-[13px] text-muted">{s.siteName}</p>
              </div>
            </div>
          </Block>

          {reviews.length > 0 && (
            <Block id="reviews" n={num()} title="Student stories">
              <div className="grid gap-5 md:grid-cols-2">{reviews.map((t) => <TestimonialCard key={t._id} t={t} />)}</div>
            </Block>
          )}

          {c.faqs?.length > 0 && (
            <Block id="faqs" n={num()} title="Questions people ask">
              <Faqs items={c.faqs} />
            </Block>
          )}
        </div>

        {/* SIDEBAR: APPLY */}
        <aside className="lg:col-span-4">
          <div id="apply" className="scroll-mt-40 lg:sticky lg:top-40">
            <div className="rounded-[24px] bg-ink p-7 text-paper sm:p-8">
              <LeadForm dark source="program-page" course={c.title} showTiming title="Apply for this program"
                subtitle="Leave your details — admissions will call you with batch dates and timings." cta="Send my application" />
            </div>
            {s.phone && (
              <a href={`tel:${s.phone}`} className="mt-4 flex items-center justify-between rounded-[20px] border border-line bg-white p-5 transition hover:border-ink">
                <span>
                  <span className="block text-[15px] text-muted">Prefer to call?</span>
                  <span className="text-lg font-bold">{s.phone}</span>
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white"><Phone size={18} /></span>
              </a>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section border-t border-line bg-white">
          <div className="container-x">
            <h2 className="display-2">More in {c.category?.name}</h2>
            <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <CourseCard key={r._id} course={r} />)}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE STICKY BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-paper p-4 lg:hidden print:hidden">
        <div className="min-w-0">
          <p className="text-[13px] text-muted">Next batch</p>
          <p className="truncate text-lg font-extrabold tracking-tight">{nb ? fmtDate(nb.startDate) : "Announcing soon"}</p>
        </div>
        <a href="#apply" className="btn btn-primary shrink-0">Apply now</a>
      </div>
    </div>
  );
}
