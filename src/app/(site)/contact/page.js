import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight, Clock } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { Course } from "@/models";
import { plain } from "@/lib/utils";
import { Kicker, TitleMark } from "@/components/site/ui";
import { sec } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { LeadForm } from "@/components/site/client";

export const generateMetadata = () => pageMeta("contact", "/contact", "Contact us");

export default async function ContactPage() {
  await connectDB();
  const [s, titles] = await Promise.all([getSettings(), Course.find({ published: true }).select("title").lean().then(plain)]);
  const wa = String(s.whatsapp || "").replace(/\D/g, "");
  const S = (k) => sec(s, k);
  const items = [
    [Phone, "Call us", s.phone, s.phone && `tel:${s.phone}`],
    [MessageCircle, "WhatsApp", wa && `+${wa}`, wa && `https://wa.me/${wa}`],
    [Mail, "Email", s.email, s.email && `mailto:${s.email}`],
    [MapPin, "Visit the campus", s.address, null],
    [Clock, "Campus hours", s.campusHours, null],
  ].filter((i) => i[2]);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x pt-16 pb-14 sm:pt-24 sm:pb-20">
          <Kicker>{S("contact_hero").kicker}</Kicker>
          <h1 className="display-page mt-5 max-w-5xl"><TitleMark t={S("contact_hero")} /></h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">{S("contact_hero").text}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="border-t border-ink">
              {items.map(([Icon, label, value, href]) => {
                const inner = (
                  <>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper-2 text-ink"><Icon size={20} /></span>
                    <span className="flex-1">
                      <span className="block text-[15px] text-muted">{label}</span>
                      <span className="text-lg font-bold text-ink">{value}</span>
                    </span>
                    {href && <ArrowUpRight size={20} className="text-brand-600" />}
                  </>
                );
                return href ? (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="flex items-center gap-4 border-b border-ink/15 py-6 transition hover:bg-white sm:px-3">{inner}</a>
                ) : (
                  <div key={label} className="flex items-center gap-4 border-b border-ink/15 py-6 sm:px-3">{inner}</div>
                );
              })}
            </div>
            {s.mapEmbed && <iframe src={s.mapEmbed} title="Map" loading="lazy" className="mt-8 h-72 w-full rounded-[20px] border-0" />}
          </div>
          <div className="rounded-[28px] border border-line bg-white p-6 sm:p-10 lg:col-span-7">
            <LeadForm source="contact" options={titles.map((t) => t.title)} showMessage showTiming
              timings={s.formTimings} title={S("contact_form").title} subtitle={S("contact_form").text} cta="Send message" />
          </div>
        </div>
      </section>
    </>
  );
}
