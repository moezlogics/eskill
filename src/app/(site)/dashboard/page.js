import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Award } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Enrollment, Order } from "@/models";
import { plain, fmtDate, formatPrice } from "@/lib/utils";
import { Thumb, StatusBadge, EmptyState, Kicker, Mark } from "@/components/site/ui";
import { LogoutButton } from "@/components/site/client";

export const metadata = { title: "My dashboard" };

export default async function DashboardPage() {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard");
  await connectDB();

  const [enr, orders] = await Promise.all([
    Enrollment.find({ user: s.id }).sort({ updatedAt: -1 }).populate("course", "title slug thumbnail duration").lean(),
    Order.find({ user: s.id }).sort({ createdAt: -1 }).populate("course", "title slug").lean(),
  ]).then((r) => r.map(plain));

  const list = enr.filter((e) => e.course);
  const certs = list.filter((e) => e.certificateId);
  const pending = orders.filter((o) => o.status === "pending").length;
  const first = String(s.name || "").split(" ")[0] || "there";

  return (
    <div className="pb-24">
      <section className="border-b border-line">
        <div className="container-x pt-14 pb-12 sm:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Kicker>Student dashboard</Kicker>
              <h1 className="display-page mt-5">Hi, <Mark>{first}.</Mark></h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {s.role === "admin" && <Link href="/admin" className="btn btn-dark">Admin panel</Link>}
              <LogoutButton className="btn btn-outline" />
            </div>
          </div>
          <div className="mt-12 grid max-w-3xl grid-cols-3 gap-6">
            {[[list.length, "Courses enrolled"], [certs.length, "Certificates earned"], [pending, "Payments in review"]].map(([v, l]) => (
              <div key={l} className="border-t border-ink pt-4">
                <p className="text-[clamp(32px,4vw,52px)] leading-none font-extrabold tracking-tight">{v}</p>
                <p className="mt-2 text-[15px] text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x mt-14">
        <h2 className="h2">Continue learning</h2>
        {list.length ? (
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <article key={e._id} className="flex flex-col">
                <Link href={`/learn/${e.course.slug}`} className="overflow-hidden rounded-[20px]">
                  <Thumb src={e.course.thumbnail} alt={e.course.title} className="aspect-video w-full transition duration-700 hover:scale-[1.03]" />
                </Link>
                <h3 className="mt-5 text-xl leading-tight font-extrabold tracking-tight">{e.course.title}</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${e.progress}%` }} />
                  </div>
                  <span className="text-[15px] font-semibold tabular-nums">{e.progress}%</span>
                </div>
                <div className="mt-5 flex gap-2">
                  <Link href={`/learn/${e.course.slug}`} className="btn btn-dark flex-1">
                    {e.progress >= 100 ? "Review course" : e.progress > 0 ? "Continue" : "Start learning"}<ArrowRight size={18} />
                  </Link>
                  {e.certificateId && <Link href={`/certificate/${e.certificateId}`} className="btn btn-accent" title="View certificate"><Award size={18} /></Link>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState title="You haven't started a course yet" text="Pick a program and your lessons will show up here.">
              <Link href="/courses" className="btn btn-primary">Browse programs</Link>
            </EmptyState>
          </div>
        )}
      </section>

      {certs.length > 0 && (
        <section className="container-x mt-20">
          <h2 className="h2">Your certificates</h2>
          <div className="mt-8 border-t border-ink">
            {certs.map((e) => (
              <Link key={e._id} href={`/certificate/${e.certificateId}`} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 py-5 transition hover:bg-white sm:px-3">
                <span>
                  <span className="block text-lg font-bold">{e.course.title}</span>
                  <span className="font-mono text-[14px] text-muted">{e.certificateId}</span>
                </span>
                <span className="link-u inline-flex items-center gap-2 font-semibold">View & print <ArrowRight size={16} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {orders.length > 0 && (
        <section className="container-x mt-20">
          <h2 className="h2">Payments</h2>
          <div className="mt-8 overflow-x-auto rounded-[20px] border border-line bg-white">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-line text-muted">
                <tr>{["Date", "Course", "Amount", "Method", "Status"].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-5 py-4 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-5 py-4 font-semibold">{o.course?.title || "—"}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{formatPrice(o.amount)}</td>
                    <td className="px-5 py-4">{o.method}</td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
