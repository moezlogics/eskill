"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FolderTree, UserCheck, GraduationCap, PhoneCall,
  Users, CalendarDays, Newspaper, FileText, Quote, CircleHelp, Building2, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  ["Overview", [["Dashboard", "/admin", LayoutDashboard]]],
  ["Programs", [["Programs", "/admin/courses", BookOpen], ["Tracks", "/admin/categories", FolderTree], ["Trainers", "/admin/instructors", UserCheck]]],
  ["Admissions", [["Applications", "/admin/leads", PhoneCall], ["Students", "/admin/users", Users], ["Certificates", "/admin/enrollments", GraduationCap]]],
  ["Website", [["Workshops", "/admin/events", CalendarDays], ["Blog", "/admin/posts", Newspaper], ["Pages", "/admin/pages", FileText], ["Testimonials", "/admin/testimonials", Quote], ["FAQs", "/admin/faqs", CircleHelp], ["Partners", "/admin/partners", Building2], ["Settings", "/admin/settings", Settings]]],
];

export default function AdminNav({ mobile = false }) {
  const path = usePathname();
  const isActive = (href) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  if (mobile)
    return (
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3">
        {NAV.flatMap(([, items]) => items).map(([label, href]) => (
          <Link key={href} href={href} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium", isActive(href) ? "bg-ink text-paper" : "bg-slate-100 text-slate-600")}>
            {label}
          </Link>
        ))}
      </nav>
    );

  return (
    <nav className="space-y-6 px-3">
      {NAV.map(([group, items]) => (
        <div key={group}>
          <p className="px-3 text-[12px] font-semibold text-white/40">{group}</p>
          <div className="mt-2 space-y-0.5">
            {items.map(([label, href, Icon]) => (
              <Link key={href} href={href}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition", isActive(href) ? "bg-accent-500 text-ink" : "text-white/70 hover:bg-white/5 hover:text-white")}>
                <Icon size={18} />{label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
