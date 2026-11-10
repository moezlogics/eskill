import { connectDB } from "@/lib/db";
import { Event } from "@/models";
import { plain } from "@/lib/utils";
import { PageHero, EventCard, EmptyState } from "@/components/site/ui";
import { LeadForm } from "@/components/site/client";

import { pageMeta } from "@/lib/seo";

export const generateMetadata = () => pageMeta("events", "/events", "Workshops & seminars");

export default async function EventsPage() {
  await connectDB();
  const today = new Date(new Date().toDateString());
  const [upcoming, past] = await Promise.all([
    Event.find({ published: true, date: { $gte: today } }).sort({ date: 1 }).lean(),
    Event.find({ published: true, date: { $lt: today } }).sort({ date: -1 }).limit(6).lean(),
  ]).then((r) => r.map(plain));

  return (
    <>
      <PageHero eyebrow="Workshops" title="Free workshops & seminars on campus" text="Short, practical sessions on SEO, AI and marketing — the easiest way to meet our trainers and see how we teach." />
      <section className="section">
        <div className="container-x">
          {upcoming.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <EventCard key={e._id} e={e} />)}</div>
          ) : (
            <EmptyState title="No workshops scheduled right now" text="New workshops are announced regularly. Leave your number below and we will invite you." />
          )}

          <div id="register" className="mx-auto mt-16 max-w-xl scroll-mt-28 rounded-[28px] bg-ink p-8 sm:p-10">
            <LeadForm dark source="workshop" options={upcoming.map((e) => e.title)} title="Register for a workshop"
              subtitle="We'll confirm your seat on WhatsApp." cta="Register free" />
          </div>

          {past.length > 0 && (
            <>
              <h2 className="h2 mt-20">Past workshops</h2>
              <div className="mt-6 grid gap-6 opacity-80 md:grid-cols-2 lg:grid-cols-3">{past.map((e) => <EventCard key={e._id} e={e} />)}</div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
