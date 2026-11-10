import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import AdminNav from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/site/client";

export const metadata = { title: { default: "Admin", template: "%s | Admin" } };

export default async function AdminLayout({ children }) {
  const s = await requireAdmin();
  if (!s) redirect("/login?next=/admin");
  const site = await getSettings();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto bg-ink py-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link href="/admin" className="px-6 text-xl font-extrabold tracking-tight text-paper">
          {site.siteName}<span className="text-brand-600">.</span>
        </Link>
        <p className="px-6 text-[13px] text-paper/50">Admin panel</p>
        <div className="mt-8 flex-1"><AdminNav /></div>
        <div className="mt-6 space-y-3 border-t border-white/10 px-6 pt-6 text-sm text-white/60">
          <p className="truncate">{s.email}</p>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><ExternalLink size={16} />View website</a>
          <LogoutButton className="hover:text-white" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin" className="text-lg font-extrabold tracking-tight">{site.siteName}<span className="text-brand-600">.</span></Link>
            <div className="flex items-center gap-4 text-sm">
              <a href="/" target="_blank" rel="noreferrer" className="font-semibold">Site</a>
              <LogoutButton className="font-semibold" />
            </div>
          </div>
          <AdminNav mobile />
        </header>
        <main className="p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
