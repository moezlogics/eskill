import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, CirclePlay, CircleCheck, Lock, Award, FileText } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Course, Enrollment } from "@/models";
import { plain, cn, toEmbed, isDirectVideo } from "@/lib/utils";
import { Prose, Kicker } from "@/components/site/ui";
import { CompleteButton } from "@/components/site/client";

export const metadata = { title: "Learning" };

function Locked({ slug }) {
  return (
    <div className="grid h-full min-h-72 place-items-center bg-forest p-8 text-center text-paper">
      <div className="max-w-sm">
        <Lock size={40} className="mx-auto text-accent-500" />
        <h3 className="mt-5 text-2xl font-extrabold tracking-tight">This lesson is part of the full program</h3>
        <p className="mt-3 text-paper/70">Enroll to unlock every lesson, project and your certificate.</p>
        <Link href={`/courses/${slug}`} className="btn btn-accent mt-7">See enrollment options</Link>
      </div>
    </div>
  );
}

export default async function LearnPage({ params, searchParams }) {
  const { slug } = await params;
  const { lesson } = await searchParams;
  const session = await getSession();
  await connectDB();

  const raw = await Course.findOne({ slug }).lean();
  if (!raw || (!raw.published && session?.role !== "admin")) notFound();
  const c = plain(raw);
  const enr = session ? plain(await Enrollment.findOne({ user: session.id, course: c._id }).lean()) : null;
  const isAdmin = session?.role === "admin";

  const sections = c.sections || [];
  const all = sections.flatMap((s, si) => (s.lessons || []).map((l) => ({ ...l, sectionTitle: s.title, sectionIndex: si })));
  if (!all.length)
    return (
      <div className="container-x py-24">
        <h1 className="display-2">Lessons are coming soon.</h1>
        <Link href={`/courses/${slug}`} className="btn btn-dark mt-8">Back to the program</Link>
      </div>
    );

  const done = new Set(enr?.completedLessons || []);
  const current =
    all.find((l) => l._id === lesson) ||
    (enr ? all.find((l) => !done.has(l._id)) : all.find((l) => l.isFree)) ||
    all[0];
  const idx = all.findIndex((l) => l._id === current._id);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const canView = !!enr || isAdmin || current.isFree;
  const href = (l) => `/learn/${slug}?lesson=${l._id}`;

  return (
    <div className="pb-20">
      <div className="border-b border-line">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-5">
          <Link href={`/courses/${slug}`} className="inline-flex items-center gap-2 text-[15px] font-semibold hover:text-brand-700">
            <ArrowLeft size={18} />{c.title}
          </Link>
          {enr && (
            <div className="flex items-center gap-3">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-paper-2">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${enr.progress}%` }} />
              </div>
              <span className="text-[15px] font-semibold tabular-nums">{enr.progress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="container-x grid gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {current.type === "text" ? (
            !canView && <div className="overflow-hidden rounded-[20px]"><Locked slug={slug} /></div>
          ) : (
            <div className="aspect-video overflow-hidden rounded-[20px] bg-ink">
              {!canView ? (
                <Locked slug={slug} />
              ) : !current.videoUrl ? (
                <div className="grid h-full place-items-center text-paper/70">
                  <div className="text-center"><CirclePlay size={52} className="mx-auto opacity-60" /><p className="mt-3">The video for this lesson is coming soon.</p></div>
                </div>
              ) : isDirectVideo(current.videoUrl) ? (
                <video src={current.videoUrl} controls controlsList="nodownload" className="h-full w-full" />
              ) : (
                <iframe src={toEmbed(current.videoUrl)} title={current.title} className="h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              )}
            </div>
          )}

          <div className="mt-8">
            <Kicker>Module {current.sectionIndex + 1} · {current.sectionTitle}</Kicker>
            <h1 className="mt-4 text-[clamp(28px,3vw,40px)] leading-tight font-extrabold tracking-[-0.03em]">{current.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-line py-5">
              {prev && <Link href={href(prev)} className="btn btn-outline"><ChevronLeft size={18} />Previous</Link>}
              {enr && <CompleteButton courseId={c._id} lessonId={current._id} done={done.has(current._id)} nextHref={next ? href(next) : ""} />}
              {next && <Link href={href(next)} className="btn btn-dark ml-auto">Next lesson <ChevronRight size={18} /></Link>}
            </div>
            {canView && current.content && <Prose text={current.content} className="mt-8" />}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[20px] border border-line bg-white">
            <div className="border-b border-line p-5">
              <p className="text-[15px] font-semibold text-muted">Course content</p>
              <p className="mt-1 text-lg font-bold">{enr ? `${done.size} of ${all.length} lessons done` : `${all.length} lessons`}</p>
              {enr?.certificateId && (
                <Link href={`/certificate/${enr.certificateId}`} className="btn btn-accent mt-4 w-full"><Award size={18} />View your certificate</Link>
              )}
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {sections.map((s, i) => (
                <div key={s._id} className="border-b border-line last:border-b-0">
                  <p className="flex items-baseline gap-3 px-5 pt-5 pb-2">
                    <span className="font-serif text-lg text-brand-600 italic">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-bold">{s.title}</span>
                  </p>
                  <div className="pb-3">
                    {(s.lessons || []).map((l) => {
                      const isCurrent = l._id === current._id;
                      const locked = !enr && !isAdmin && !l.isFree;
                      const Icon = done.has(l._id) ? CircleCheck : locked ? Lock : l.type === "text" ? FileText : CirclePlay;
                      return (
                        <Link key={l._id} href={href(l)}
                          className={cn("mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition", isCurrent ? "bg-ink text-paper" : "hover:bg-paper")}>
                          <Icon size={17} className={cn("shrink-0", done.has(l._id) ? "text-emerald-600" : isCurrent ? "text-accent-500" : "text-ink/35")} />
                          <span className="line-clamp-2 flex-1">{l.title}</span>
                          {l.duration && <span className={cn("text-[13px] tabular-nums", isCurrent ? "text-paper/60" : "text-muted")}>{l.duration}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
