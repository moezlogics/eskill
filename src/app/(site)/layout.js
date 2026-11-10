import { MessageCircle } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { Category, Course } from "@/models";
import { plain } from "@/lib/utils";

export default async function SiteLayout({ children }) {
  await connectDB();
  const [settings, session, cats, progs] = await Promise.all([
    getSettings(),
    getSession(),
    Category.find({ showInMenu: true }).sort({ order: 1, name: 1 }).select("name slug icon").lean(),
    Course.find({ published: true }).sort({ order: 1, createdAt: 1 }).select("title slug category").lean(),
  ]);
  const programs = plain(progs);
  const categories = plain(cats).map((c) => ({ ...c, programs: programs.filter((p) => String(p.category) === c._id) }));
  const site = {
    siteName: settings.siteName, logo: settings.logo, phone: settings.phone,
    email: settings.email, topbarText: settings.topbarText, headerCta: settings.headerCta,
  };
  const wa = String(settings.whatsapp || "").replace(/\D/g, "");

  return (
    <>
      <Header site={site} user={session ? { name: session.name, role: session.role } : null} categories={categories} />
      <main>{children}</main>
      <Footer site={settings} categories={categories} />
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
          className="fixed right-5 bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[4px_4px_0_0_#121212] transition hover:scale-110 lg:bottom-6 print:hidden">
          <MessageCircle size={28} />
        </a>
      )}
    </>
  );
}
