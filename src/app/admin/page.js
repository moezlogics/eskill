import Link from "next/link";
import { Users, BookOpen, GraduationCap, PhoneCall, Inbox, CalendarDays, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { User, Course, Enrollment, Lead } from "@/models";
import { plain, fmtDate, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/site/ui";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  await connectDB();
  const today = new Date(new Date().toDateString());
  const [newLeads, totalLeads, programs, students, certificates, leads, courses] = await Promise.all([
    Lead.countDocuments({ status: "new" }),
    Lead.countDocuments(),
    Course.countDocuments({ published: true }),
    User.countDocuments({ role: "student" }),
    Enrollment.countDocuments({ certificateId: { $exists: true, $ne: null } }),
    Lead.find().sort({ createdAt: -1 }).limit(8).lean().then(plain),
    Course.find({ "batches.startDate": { $gte: today } }).select("title slug batches").lean().then(plain),
  ]);
  const batches = courses
    .flatMap((c) => c.batches.filter((b) => b.startDate && new Date(b.startDate) >= today).map((b) => ({ ...b, course: c })))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const cards = [
    [Inbox, newLeads, "New applications", "/admin/leads"],
    [PhoneCall, totalLeads, "Total applications & leads", "/admin/leads"],
    [CalendarDays, batches.length, "Upcoming batches", "/admin/courses"],
    [BookOpen, programs, "Live programs", "/admin/courses"],
    [Users, students, "Students", "/admin/users"],
    [GraduationCap, certificates, "Certificates issued", "/admin/enrollments"],
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Dashboard</h1>
        <p className="text-[15px] text-muted">Applications, batches and programs at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([Icon, value, label, href], i) => (
          <Link key={label} href={href}
            className={cn("flex items-center gap-4 rounded-[20px] border p-5 transition", i === 0 ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink")}>
            <span className={cn("grid h-12 w-12 place-items-center rounded-full", i === 0 ? "bg-accent-500 text-ink" : "bg-paper-2 text-ink")}><Icon size={22} /></span>
            <div>
              <p className="text-2xl font-extrabold tracking-tight">{value}</p>
              <p className={cn("text-sm", i === 0 ? "text-paper/70" : "text-muted")}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="overflow-hidden rounded-[20px] border border-line bg-white xl:col-span-3">
          <div className="flex items-center justify-between border-b border-line p-5">
            <h2 className="font-bold">Latest applications</h2>
            <Link href="/admin/leads" className="flex items-center gap-1 text-sm font-semibold text-brand-700">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-line">
                {leads.length ? leads.map((l) => (
                  <tr key={l._id}>
                    <td className="px-5 py-3"><p className="font-semibold">{l.name}</p><p className="text-xs text-muted">{fmtDate(l.createdAt)} · {l.source}</p></td>
                    <td className="px-5 py-3 whitespace-nowrap"><a href={`tel:${l.phone}`} className="font-semibold text-brand-700">{l.phone}</a></td>
                    <td className="px-5 py-3 text-muted">{l.course || "—"}{l.preferredTime && <span className="block text-xs">{l.preferredTime}</span>}</td>
                    <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                  </tr>
                )) : <tr><td className="px-5 py-10 text-center text-muted">No applications yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-line bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line p-5">
            <h2 className="font-bold">Upcoming batches</h2>
            <Link href="/admin/courses" className="flex items-center gap-1 text-sm font-semibold text-brand-700">Edit <ArrowRight size={14} /></Link>
          </div>
          <ul className="divide-y divide-line text-sm">
            {batches.length ? batches.slice(0, 8).map((b, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                <span><span className="block font-semibold">{b.course.title}</span><span className="text-xs text-muted">{[b.days, b.timing].filter(Boolean).join(" · ")}</span></span>
                <span className="shrink-0 text-right font-bold">{fmtDate(b.startDate)}{b.seatsLeft > 0 && <span className="block text-xs font-normal text-muted">{b.seatsLeft} seats</span>}</span>
              </li>
            )) : <li className="px-5 py-10 text-center text-muted">No batches scheduled — add them inside each program.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
