import Link from "next/link";
import { Logo } from "./Header";

function Col({ title, links, className = "" }) {
  return (
    <div className={className}>
      <h4 className="text-[15px] font-semibold text-paper/50">{title}</h4>
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={href}><Link href={href} className="text-[16px] text-paper/85 transition hover:text-accent-500">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ site, categories = [] }) {
  const socials = [["Facebook", site.facebook], ["Instagram", site.instagram], ["YouTube", site.youtube], ["LinkedIn", site.linkedin], ["TikTok", site.tiktok]].filter((s) => s[1]);

  return (
    <footer className="overflow-hidden bg-ink text-paper print:hidden">
      <div className="container-x pt-20 pb-10 sm:pt-28">
        <div className="grid gap-10 border-b border-paper/15 pb-16 lg:grid-cols-12 lg:items-end">
          <h2 className="display-2 text-paper lg:col-span-8">
            {site.h_footer_title || "Your next skill starts"}{" "}<span className="font-serif font-normal tracking-normal text-accent-500 italic">{site.h_footer_highlight || "in a real classroom."}</span>
          </h2>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Link href="/admissions#apply" className="btn btn-accent btn-lg">Apply for a batch</Link>
            <Link href="/courses" className="btn btn-lg border border-paper/30 text-paper hover:bg-paper hover:text-ink">See programs</Link>
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo name={site.siteName} logo={site.logo} light />
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-paper/60">{site.footerAbout}</p>
          </div>
          <Col title="Institute" className="lg:col-span-2"
            links={[["About us", "/about"], ["All programs", "/courses"], ["Admissions", "/admissions"], ["Workshops", "/events"], ["Blog", "/blog"], ["Contact", "/contact"]]} />
          <Col title="Programs" className="lg:col-span-3" links={categories.flatMap((c) => c.programs || []).slice(0, 8).map((p) => [p.title, `/courses/${p.slug}`])} />
          <div className="lg:col-span-3">
            <h4 className="text-[15px] font-semibold text-paper/50">Get in touch</h4>
            <ul className="mt-5 space-y-3 text-[16px] text-paper/85">
              {site.phone && <li><a href={`tel:${site.phone}`} className="hover:text-accent-500">{site.phone}</a></li>}
              {site.email && <li><a href={`mailto:${site.email}`} className="hover:text-accent-500">{site.email}</a></li>}
              {site.address && <li className="text-paper/60">{site.address}</li>}
              {site.campusHours && <li className="text-paper/60">{site.campusHours}</li>}
            </ul>
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {socials.map(([n, u]) => (
                  <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="link-u text-[15px] text-paper/85">{n}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-paper/15 pt-8 text-[14px] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.siteName}. Built with care in Pakistan.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[["Privacy", "/p/privacy-policy"], ["Terms", "/p/terms-and-conditions"], ["Refunds", "/p/refund-policy"], ["Verify a certificate", "/verify"]].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-paper">{l}</Link>
            ))}
          </div>
        </div>
      </div>

      <p aria-hidden="true" className="container-x -mb-[0.16em] text-[clamp(64px,15vw,240px)] leading-[0.8] font-extrabold tracking-[-0.06em] whitespace-nowrap text-paper/10 select-none">
        {site.siteName}
      </p>
    </footer>
  );
}
