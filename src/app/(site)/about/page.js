import Link from "next/link";
import { ArrowRight, Check, MapPin, Clock } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { Instructor, Testimonial } from "@/models";
import { plain } from "@/lib/utils";
import { sec } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { TitleMark, Kicker, Mark, PhotoOr, Prose, StatsBand, SectionHead, MentorCard, TestimonialCard } from "@/components/site/ui";

export const generateMetadata = () => pageMeta("about", "/about", "About us");

export default async function AboutPage() {
  await connectDB();
  const [s, mentors, reviews] = await Promise.all([
    getSettings(),
    Instructor.find().sort({ order: 1 }).lean(),
    Testimonial.find({ featured: true }).sort({ order: 1 }).limit(3).lean(),
  ]).then((r) => r.map(plain));
  const whyUs = s.whyUs || [];
  const S = (k) => sec(s, k);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x pt-16 pb-14 sm:pt-24 sm:pb-20">
          <Kicker>About {s.siteName}</Kicker>
          <h1 className="display-page mt-5 max-w-5xl">{s.aboutTitle}</h1>
          {s.tagline && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">{s.tagline}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container-x grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <PhotoOr src={s.aboutImage} alt={s.siteName} className="aspect-[4/5] w-full rounded-[28px]" title={S("about_story").title} />
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <Kicker>{S("about_story").kicker}</Kicker>
            <Prose text={s.aboutText} className="mt-6 text-[19px]" />
          </div>
        </div>
      </section>

      {s.mission && (
        <section className="bg-forest text-paper">
          <div className="container-x grid gap-8 py-20 sm:py-28 lg:grid-cols-12">
            <div className="lg:col-span-3"><Kicker light>Our mission</Kicker></div>
            <p className="text-[clamp(26px,3.2vw,46px)] leading-[1.18] font-semibold tracking-[-0.02em] lg:col-span-9">{s.mission}</p>
          </div>
        </section>
      )}

      {s.vision && (
        <section className="section">
          <div className="container-x grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3"><Kicker>Where we&apos;re headed</Kicker></div>
            <p className="font-serif text-[clamp(32px,4.4vw,60px)] leading-[1.08] italic lg:col-span-9">{s.vision}</p>
          </div>
        </section>
      )}

      {whyUs.length > 0 && (
        <section className="section border-t border-line bg-white">
          <div className="container-x">
            <SectionHead kicker={S("about_principles").kicker} title={S("about_principles").title} />
            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {whyUs.map((w, i) => (
                <div key={w.title} className="border-t border-ink pt-6">
                  <p className="font-serif text-4xl text-brand-600 italic">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">{w.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-muted">{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <StatsBand stats={s.stats || []} />

      <section className="section">
        <div className="container-x">
          <SectionHead kicker={S("about_team").kicker} title={<TitleMark t={S("about_team")} />} text={S("about_team").text} />
          {mentors.length > 0 ? (
            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {mentors.map((m) => <MentorCard key={m._id} m={m} />)}
            </div>
          ) : (
            <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {(s.trainerPrinciples || []).map(({ title: t, text: d }, i) => (
                <div key={t} className="border-t border-ink pt-6">
                  <p className="font-serif text-4xl text-brand-600 italic">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">{t}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-muted">{d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section border-t border-line bg-white">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <PhotoOr src={s.campusImage} alt="Campus" className="aspect-[4/3] w-full rounded-[28px]" title="Your classroom is waiting." lines={s.campusFeatures || []} />
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
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section border-t border-line bg-white">
          <div className="container-x">
            <SectionHead kicker={sec(s, "home_stories").kicker} title={sec(s, "home_stories").title} />
            <div className="mt-14 grid gap-6 md:grid-cols-3">{reviews.map((t) => <TestimonialCard key={t._id} t={t} />)}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-x flex flex-col items-start justify-between gap-8 border-t border-ink pt-12 lg:flex-row lg:items-end">
          <h2 className="display-2 max-w-3xl"><TitleMark t={S("about_cta")} /></h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admissions#apply" className="btn btn-primary btn-lg">Book a campus visit</Link>
            <Link href="/courses" className="btn btn-outline btn-lg">See programs <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
