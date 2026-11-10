import Link from "next/link";
import { ArrowRight, ArrowUpRight, Phone, MapPin, Clock, Check, X } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { Course, Category, Instructor, Testimonial, Faq, Partner, Post, Event } from "@/models";
import { plain, fmtDate, cn } from "@/lib/utils";
import CourseCard from "@/components/site/CourseCard";
import { SectionHead, Kicker, Mark, HandArrow, Avatar, Faqs, MentorCard, TestimonialCard, EventCard, PostCard, HeroBoard, PhotoOr } from "@/components/site/ui";
import { LeadForm } from "@/components/site/client";

export default async function HomePage() {
  await connectDB();
  const today = new Date(new Date().toDateString());
  const [s, courses, cats, mentors, reviews, faqs, partners, posts, events] = await Promise.all([
    getSettings(),
    Course.find({ published: true }).sort({ order: 1, createdAt: 1 })
      .select("-description -sections.lessons.content").populate("category", "name slug order").lean(),
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Instructor.find().sort({ order: 1 }).limit(4).lean(),
    Testimonial.find({ featured: true }).sort({ order: 1, createdAt: -1 }).limit(6).lean(),
    Faq.find().sort({ order: 1 }).limit(8).lean(),
    Partner.find().sort({ order: 1 }).lean(),
    Post.find({ published: true }).sort({ createdAt: -1 }).limit(3).select("-content").lean(),
    Event.find({ published: true, date: { $gte: today } }).sort({ date: 1 }).limit(3).lean(),
  ]).then((r) => r.map(plain));

  const featured = courses.filter((c) => c.featured).slice(0, 6);
  const tracks = cats.map((c) => ({ ...c, programs: courses.filter((p) => p.category?._id === c._id) })).filter((t) => t.programs.length);
  const batches = courses
    .flatMap((c) => (c.batches || []).filter((b) => b.startDate && new Date(b.startDate) >= today).map((b) => ({ ...b, course: c })))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 8);
  const soonest = batches[0];
  const stats = s.stats || [];
  const whyUs = s.whyUs || [];
  const comparison = s.comparison || [];
  const howSteps = s.howSteps || [];
  const ticker = courses.map((c) => c.title);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x grid gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-28">
          <div className="min-w-0 lg:col-span-7 lg:pt-4">
            {s.heroBadge && <Kicker>{s.heroBadge}</Kicker>}
            <h1 className="display-hero mt-7">
              {s.heroTitle}{" "}{s.heroHighlight && <Mark>{s.heroHighlight}</Mark>}
            </h1>
            <p className="mt-8 max-w-xl text-[19px] leading-relaxed text-ink/75 sm:text-xl">{s.heroSubtitle}</p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/courses" className="btn btn-primary btn-lg">Explore programs <ArrowRight size={20} /></Link>
              <Link href="/admissions#apply" className="btn btn-outline btn-lg">Book a campus visit</Link>
              <span className="hidden items-center gap-1 sm:flex">
                <HandArrow className="h-10 w-14 -scale-x-100 text-brand-600" />
                <span className="font-serif text-xl text-ink/70 italic">free counselling</span>
              </span>
            </div>

            {stats.length > 0 && (
              <div className="mt-14 grid max-w-xl grid-cols-3 border-t border-ink/15 pt-6">
                {stats.slice(0, 3).map((st, i) => (
                  <div key={st.label} className={cn("min-w-0", i > 0 && "border-l border-ink/15 pl-3 sm:pl-5")}>
                    <p className="text-[clamp(17px,2.6vw,36px)] leading-tight font-extrabold tracking-tight break-words">{st.value}</p>
                    <p className="mt-2 text-[13px] text-muted sm:text-[15px]">{st.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className={cn("overflow-hidden rounded-[28px]", s.heroImage ? "aspect-[4/5]" : "lg:aspect-[4/5]")}>
                {s.heroImage ? <img src={s.heroImage} alt={s.siteName} className="h-full w-full object-cover" /> : <HeroBoard />}
              </div>
              <div className="absolute -top-4 -left-3 -rotate-6 rounded-2xl bg-accent-500 px-5 py-4 text-ink shadow-[6px_6px_0_0_#121212] sm:-left-8">
                <p className="text-sm font-semibold">{soonest ? "Next batch starts" : "Admissions"}</p>
                <p className="text-2xl font-extrabold tracking-tight">{soonest ? fmtDate(soonest.startDate) : "Open now"}</p>
              </div>
              <div className="absolute -right-2 -bottom-5 grid h-32 w-32 rotate-12 place-items-center rounded-full bg-brand-600 text-center text-white shadow-[6px_6px_0_0_#121212] sm:-right-6">
                <p className="font-serif text-2xl leading-none italic">On<br />campus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      {ticker.length > 0 && (
        <section aria-hidden="true" className="overflow-hidden bg-ink py-6 text-paper sm:py-8">
          <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center gap-10 text-[clamp(28px,4vw,56px)] font-extrabold tracking-tight">
                {t}<span className="text-brand-600">✺</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* MISSION */}
      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3"><Kicker>Why we exist</Kicker></div>
          <div className="lg:col-span-9">
            <p className="text-[clamp(26px,3.2vw,46px)] leading-[1.18] font-semibold tracking-[-0.02em]">{s.mission}</p>
            <Link href="/about" className="link-u mt-8 inline-flex items-center gap-2 text-lg font-semibold">Read our story <ArrowRight size={18} /></Link>
          </div>
        </div>
        {whyUs.length > 0 && (
          <div className="container-x mt-20 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((w, i) => (
              <div key={w.title} className="border-t border-ink pt-6">
                <p className="font-serif text-4xl text-brand-600 italic">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{w.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-muted">{w.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROGRAMS BY TRACK */}
      {tracks.length > 0 && (
        <section className="section border-t border-line bg-white">
          <div className="container-x">
            <SectionHead kicker="What we teach" title={<>{courses.length} programs. <Mark>One goal: job-ready.</Mark></>}
              text="Pick one specialisation or stack them. Each program has its own page with the full curriculum, schedule and projects."
              action={<Link href="/courses" className="btn btn-dark">All programs <ArrowRight size={18} /></Link>} />
            <div className="mt-16 space-y-14">
              {tracks.map((t, ti) => (
                <div key={t._id} className="grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <p className="font-serif text-2xl text-brand-600 italic">{String(ti + 1).padStart(2, "0")}</p>
                    <h3 className="mt-2 text-[clamp(28px,3vw,40px)] leading-none font-extrabold tracking-tight">{t.name}</h3>
                    {t.description && <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-muted">{t.description}</p>}
                  </div>
                  <div className="border-t border-ink lg:col-span-8">
                    {t.programs.map((p) => (
                      <Link key={p._id} href={`/courses/${p.slug}`}
                        className="group grid grid-cols-12 items-center gap-3 border-b border-ink/15 px-2 py-5 transition-colors hover:bg-ink hover:text-paper sm:px-4">
                        <span className="col-span-10 sm:col-span-6">
                          <span className="block text-[clamp(20px,2.2vw,28px)] leading-tight font-extrabold tracking-tight">{p.title}</span>
                          {p.subtitle && <span className="mt-1 line-clamp-1 block text-[15px] text-muted group-hover:text-paper/70 sm:hidden">{p.subtitle}</span>}
                        </span>
                        <span className="hidden text-[15px] text-muted group-hover:text-paper/70 sm:col-span-4 sm:block">
                          {[p.duration, p.level].filter(Boolean).join(" · ")}
                        </span>
                        <span className="col-span-2 flex justify-end">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-current transition group-hover:border-brand-600 group-hover:bg-brand-600">
                            <ArrowUpRight size={18} />
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHead kicker="Most asked about" title="Where most students start"
              action={<Link href="/courses" className="btn btn-outline">Browse all <ArrowRight size={18} /></Link>} />
            <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* TRADITIONAL VS US */}
      {comparison.length > 0 && (
        <section className="section bg-ink text-paper">
          <div className="container-x">
            <SectionHead light kicker="Why we're different" title={<>Not another <Mark color="text-accent-500">computer course.</Mark></>}
              text="Here's what changes when the syllabus is built by people who do this work every week." />
            <div className="mt-14 overflow-hidden rounded-[24px] border border-paper/15">
              <div className="hidden grid-cols-12 border-b border-paper/15 bg-paper/5 px-6 py-4 text-[14px] font-semibold text-paper/60 md:grid">
                <span className="col-span-2">Topic</span><span className="col-span-4">Typical institute</span><span className="col-span-6 text-accent-500">At {s.siteName}</span>
              </div>
              {comparison.map((r) => (
                <div key={r.topic} className="grid gap-3 border-b border-paper/10 px-6 py-6 last:border-b-0 md:grid-cols-12 md:items-center md:gap-6">
                  <span className="text-[15px] font-semibold text-paper/60 md:col-span-2">{r.topic}</span>
                  <span className="flex items-start gap-2.5 text-[16px] text-paper/55 md:col-span-4"><X size={18} className="mt-0.5 shrink-0 text-paper/35" />{r.traditional}</span>
                  <span className="flex items-start gap-2.5 text-[17px] font-semibold md:col-span-6"><Check size={20} className="mt-0.5 shrink-0 text-accent-500" />{r.ours}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW A BATCH WORKS */}
      {howSteps.length > 0 && (
        <section className="section bg-forest text-paper">
          <div className="container-x">
            <SectionHead light kicker="How a batch works" title={<>From first visit to <Mark color="text-accent-500">final project.</Mark></>} />
            <ol className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
              {howSteps.map((st, i) => (
                <li key={st.title} className="border-t border-paper/25 pt-6">
                  <p className="font-serif text-6xl leading-none text-accent-500 italic">{i + 1}</p>
                  <h3 className="mt-6 text-2xl font-bold tracking-tight">{st.title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-paper/70">{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* UPCOMING BATCHES */}
      {batches.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHead kicker="Upcoming batches" title="Seats are limited. Pick your start date."
              action={<Link href="/admissions" className="btn btn-outline">Admissions <ArrowRight size={18} /></Link>} />
            <div className="mt-14 border-t border-ink">
              {batches.map((b, i) => (
                <div key={i} className="grid items-center gap-3 border-b border-ink/15 py-5 md:grid-cols-12 md:gap-6">
                  <p className="text-xl font-extrabold tracking-tight md:col-span-2">{fmtDate(b.startDate)}</p>
                  <Link href={`/courses/${b.course.slug}`} className="text-lg font-semibold hover:underline md:col-span-4">{b.course.title}</Link>
                  <p className="text-[15px] text-muted md:col-span-3">{[b.days, b.timing].filter(Boolean).join(" · ")}</p>
                  <div className="flex items-center gap-3 md:col-span-3 md:justify-end">
                    {b.seatsLeft > 0 && <span className={cn("tag", b.seatsLeft <= 8 ? "bg-brand-600 text-white" : "bg-paper-2 text-ink")}>{b.seatsLeft} seats left</span>}
                    <Link href={`/courses/${b.course.slug}#apply`} className="btn btn-dark py-2.5">Apply</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CAMPUS */}
      <section className="section border-t border-line bg-white">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <PhotoOr src={s.campusImage} alt="Campus" className="aspect-[4/3] w-full rounded-[28px]"
              title="Your classroom is waiting." lines={s.campusFeatures || []} />
          </div>
          <div className="lg:col-span-6">
            <Kicker>The campus</Kicker>
            <h2 className="display-2 mt-4">{s.campusTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">{s.campusText}</p>
            {s.campusImage && (s.campusFeatures || []).length > 0 && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.campusFeatures.map((f) => <li key={f} className="flex gap-3 text-[16px]"><Check size={20} className="mt-0.5 shrink-0 text-brand-600" />{f}</li>)}
              </ul>
            )}
            <div className="mt-8 space-y-3 border-t border-line pt-6 text-[16px]">
              {s.address && <p className="flex gap-3"><MapPin size={20} className="mt-0.5 shrink-0 text-brand-600" />{s.address}</p>}
              {s.campusHours && <p className="flex gap-3"><Clock size={20} className="mt-0.5 shrink-0 text-brand-600" />{s.campusHours}</p>}
            </div>
            <Link href="/admissions#apply" className="btn btn-primary btn-lg mt-8">Book a campus visit</Link>
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      {mentors.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHead kicker="Trainers" title={<>Taught by people who <Mark>do the work.</Mark></>}
              text="Every trainer runs live client projects — and brings them into class." />
            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {mentors.map((m) => <MentorCard key={m._id} m={m} />)}
            </div>
          </div>
        </section>
      )}

      {/* STUDENT STORIES */}
      {reviews.length > 0 && (
        <section className="section border-t border-line bg-white">
          <div className="container-x">
            <SectionHead kicker="Student stories" title="In their own words" />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              <figure className="flex flex-col justify-between rounded-[24px] bg-ink p-8 text-paper sm:p-10 lg:col-span-2 lg:row-span-2">
                <blockquote className="font-serif text-[clamp(26px,3vw,42px)] leading-[1.2]">“{reviews[0].text}”</blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <Avatar src={reviews[0].photo} name={reviews[0].name} className="h-14 w-14 text-ink" />
                  <div>
                    <p className="text-lg font-bold">{reviews[0].name}</p>
                    <p className="text-paper/60">{[reviews[0].role, reviews[0].company].filter(Boolean).join(" · ")}</p>
                  </div>
                </figcaption>
              </figure>
              {reviews.slice(1, 3).map((t) => <TestimonialCard key={t._id} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* PARTNERS */}
      {partners.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="container-x">
            <p className="text-lg font-semibold text-muted">Partners</p>
            <div className="mt-8 grid grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {partners.map((p) =>
                p.logo
                  ? <img key={p._id} src={p.logo} alt={p.name} className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  : <span key={p._id} className="text-xl font-bold text-ink/40">{p.name}</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* WORKSHOPS */}
      {events.length > 0 && (
        <section className="section border-t border-line">
          <div className="container-x">
            <SectionHead kicker="Free workshops" title="Come for a workshop. See how we teach."
              action={<Link href="/events" className="btn btn-outline">All workshops <ArrowRight size={18} /></Link>} />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => <EventCard key={e._id} e={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* APPLY */}
      <section id="apply" className="scroll-mt-24 py-8 sm:py-12">
        <div className="container-x">
          <div className="grid gap-10 rounded-[32px] bg-brand-600 p-8 text-white sm:p-12 lg:grid-cols-12 lg:gap-14 lg:p-16">
            <div className="lg:col-span-6">
              <p className="text-lg font-semibold text-white/80">Admissions open</p>
              <h2 className="display-2 mt-4 text-white">{s.ctaTitle}</h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">{s.ctaText}</p>
              {s.phone && (
                <a href={`tel:${s.phone}`} className="mt-10 inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight hover:underline">
                  <Phone size={22} />{s.phone}
                </a>
              )}
            </div>
            <div className="rounded-[24px] bg-white p-6 text-ink sm:p-8 lg:col-span-6">
              <LeadForm source="home-apply" options={courses.map((c) => c.title)} showTiming showCity
                title="Apply for the next batch" subtitle="Takes 30 seconds. We'll call you back." cta="Send my application" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Kicker>FAQ</Kicker>
              <h2 className="display-2 mt-4">Questions, answered.</h2>
              {s.phone && (
                <p className="mt-6 text-lg text-muted">
                  Still unsure? Call us on <a href={`tel:${s.phone}`} className="link-u font-semibold text-ink">{s.phone}</a>
                </p>
              )}
            </div>
            <div className="lg:col-span-8"><Faqs items={faqs} /></div>
          </div>
        </section>
      )}

      {/* BLOG */}
      {posts.length > 0 && (
        <section className="section border-t border-line">
          <div className="container-x">
            <SectionHead kicker="From the blog" title="Guides for your next step"
              action={<Link href="/blog" className="btn btn-outline">Read the blog <ArrowRight size={18} /></Link>} />
            <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3">
              {posts.map((p) => <PostCard key={p._id} p={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
