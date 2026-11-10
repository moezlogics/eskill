import Link from "next/link";
import { Check, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { Course, Faq } from "@/models";
import { plain, fmtDate, cn } from "@/lib/utils";
import { Kicker, TitleMark, Faqs } from "@/components/site/ui";
import { sec } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { LeadForm } from "@/components/site/client";

export const generateMetadata = () => pageMeta("admissions", "/admissions", "Admissions");

export default async function AdmissionsPage() {
  await connectDB();
  const today = new Date(new Date().toDateString());
  const [s, courses, faqs] = await Promise.all([
    getSettings(),
    Course.find({ published: true }).sort({ order: 1, createdAt: 1 }).select("title slug duration batches").lean().then(plain),
    Faq.find().sort({ order: 1 }).lean().then(plain),
  ]);
  const batches = courses
    .flatMap((c) => (c.batches || []).filter((b) => b.startDate && new Date(b.startDate) >= today).map((b) => ({ ...b, course: c })))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const steps = s.admissionSteps || [];
  const eligibility = s.eligibility || [];
  const wa = String(s.whatsapp || "").replace(/\D/g, "");
  const S = (k) => sec(s, k);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x pt-16 pb-14 sm:pt-24 sm:pb-20">
          <Kicker>{S("admissions_hero").kicker}</Kicker>
          <h1 className="display-page mt-5 max-w-5xl"><TitleMark t={S("admissions_hero")} /></h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">
            {S("admissions_hero").text}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#apply" className="btn btn-primary btn-lg">Apply now</a>
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg"><MessageCircle size={18} />WhatsApp admissions</a>}
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <section className="section">
          <div className="container-x">
            <Kicker>{S("admissions_steps").kicker}</Kicker>
            <ol className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((st, i) => (
                <li key={st.title} className="border-t border-ink pt-6">
                  <p className="font-serif text-6xl leading-none text-brand-600 italic">{i + 1}</p>
                  <h3 className="mt-6 text-2xl font-bold tracking-tight">{st.title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-muted">{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section bg-forest text-paper">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker light>{S("admissions_eligibility").kicker}</Kicker>
            <h2 className="display-2 mt-4 text-paper">{S("admissions_eligibility").title}</h2>
            <ul className="mt-8 space-y-4 text-[17px] text-paper/85">
              {eligibility.map((e) => <li key={e} className="flex gap-3"><Check size={20} className="mt-0.5 shrink-0 text-accent-500" />{e}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <Kicker light>{S("admissions_timings").kicker}</Kicker>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {(s.batchTimes || []).map(({ title: t, hours: h, text: d }) => (
                <div key={t} className="rounded-[20px] border border-paper/15 p-6">
                  <p className="text-2xl font-extrabold tracking-tight">{t}</p>
                  <p className="mt-1 font-semibold text-accent-500">{h}</p>
                  <p className="mt-3 text-[15px] text-paper/70">{d}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] text-paper/60">{S("admissions_timings").text}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Kicker>{S("admissions_batches").kicker}</Kicker>
          <h2 className="display-2 mt-4">{S("admissions_batches").title}</h2>
          {batches.length ? (
            <div className="mt-12 overflow-x-auto rounded-[24px] border border-line bg-white">
              <table className="w-full min-w-[720px] text-left text-[16px]">
                <thead className="border-b border-line text-[14px] text-muted">
                  <tr>{["Starts", "Program", "Days", "Timing", "Duration", ""].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {batches.map((b, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4 font-extrabold whitespace-nowrap">{fmtDate(b.startDate)}</td>
                      <td className="px-5 py-4"><Link href={`/courses/${b.course.slug}`} className="font-semibold hover:underline">{b.course.title}</Link></td>
                      <td className="px-5 py-4 text-muted">{b.days || "—"}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{b.timing || "—"}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{b.course.duration || "—"}</td>
                      <td className="px-5 py-4 text-right">
                        {b.seatsLeft > 0 && <span className={cn("tag mr-3", b.seatsLeft <= 8 ? "bg-brand-600 text-white" : "bg-paper-2 text-ink")}>{b.seatsLeft} left</span>}
                        <Link href={`/courses/${b.course.slug}#apply`} className="link-u font-semibold whitespace-nowrap">Apply</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-8 text-lg text-muted">New batch dates are being finalised. Apply below and we&apos;ll call you as soon as they&apos;re out.</p>
          )}
        </div>
      </section>

      <section id="apply" className="scroll-mt-24 py-8 sm:py-12">
        <div className="container-x">
          <div className="grid gap-10 rounded-[32px] bg-brand-600 p-8 text-white sm:p-12 lg:grid-cols-12 lg:gap-14 lg:p-16">
            <div className="lg:col-span-5">
              <p className="text-lg font-semibold text-white/80">{S("admissions_form").kicker}</p>
              <h2 className="display-2 mt-4 text-white">{s.ctaTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-white/85">{s.ctaText}</p>
              <div className="mt-10 space-y-4 text-[17px]">
                {s.phone && <a href={`tel:${s.phone}`} className="flex items-center gap-3 font-bold hover:underline"><Phone size={20} />{s.phone}</a>}
                {s.address && <p className="flex gap-3"><MapPin size={20} className="mt-0.5 shrink-0" />{s.address}</p>}
                {s.campusHours && <p className="flex gap-3"><Clock size={20} className="mt-0.5 shrink-0" />{s.campusHours}</p>}
              </div>
            </div>
            <div className="rounded-[24px] bg-white p-6 text-ink sm:p-8 lg:col-span-7">
              <LeadForm source="admissions" options={courses.map((c) => c.title)} showTiming showCity showMessage
                timings={s.formTimings} title={S("admissions_form").title} subtitle={S("admissions_form").text} cta="Send my application" />
            </div>
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Kicker>{S("admissions_faq").kicker}</Kicker>
              <h2 className="display-2 mt-4">{S("admissions_faq").title}</h2>
            </div>
            <div className="lg:col-span-8"><Faqs items={faqs} /></div>
          </div>
        </section>
      )}
    </>
  );
}
