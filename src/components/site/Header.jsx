"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowUpRight, Phone, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ name, logo, light = false }) {
  if (logo) return <img src={logo} alt={name} className="h-10 w-auto" />;
  return (
    <span className={cn("text-[22px] font-extrabold tracking-[-0.03em]", light ? "text-paper" : "text-ink")}>
      {name}<span className="text-brand-600">.</span>
    </span>
  );
}

const LINKS = [["Programs", "/courses"], ["Admissions", "/admissions"], ["Workshops", "/events"], ["About", "/about"], ["Blog", "/blog"], ["Contact", "/contact"]];

export default function Header({ site, user, categories = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = (href) => pathname.startsWith(href);
  const isAdmin = user?.role === "admin";
  const close = () => setOpen(false);
  const tracks = categories.filter((c) => c.programs?.length);

  return (
    <>
      {site.topbarText && (
        <div className="bg-ink py-2.5 text-center text-[14px] font-medium text-paper print:hidden">{site.topbarText}</div>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md print:hidden">
        <div className="container-x flex h-20 items-center justify-between gap-6">
          <Link href="/" aria-label="Home"><Logo name={site.siteName} logo={site.logo} /></Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map(([label, href]) =>
              label === "Programs" && tracks.length ? (
                <div key={href} className="group flex h-20 items-center">
                  <Link href={href} className={cn("nav-link flex items-center gap-1.5", active(href) && "bg-ink/5")}>
                    Programs <ChevronDown size={16} className="transition group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute inset-x-0 top-full opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="container-x pt-3">
                    <div className="grid grid-cols-12 overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_30px_60px_-24px_rgba(18,18,18,0.3)]">
                      <div className="col-span-9 grid grid-cols-3 gap-6 p-7">
                        {tracks.map((c) => (
                          <div key={c._id}>
                            <Link href={`/courses?category=${c.slug}`} className="text-[13px] font-semibold tracking-wide text-brand-700 hover:underline">{c.name}</Link>
                            <ul className="mt-3 space-y-0.5">
                              {c.programs.map((p) => (
                                <li key={p._id}>
                                  <Link href={`/courses/${p.slug}`} className="-mx-2 block rounded-lg px-2 py-1.5 text-[15px] font-semibold leading-snug transition hover:bg-paper">{p.title}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="col-span-3 flex flex-col justify-between bg-forest p-6 text-paper">
                        <p className="font-serif text-[28px] leading-tight italic">Not sure which program fits you?</p>
                        <div>
                          <p className="text-[15px] text-paper/70">Free counselling on call or at campus.</p>
                          <Link href="/admissions#apply" className="btn btn-accent mt-4 w-full">Talk to an advisor</Link>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={href} href={href} className={cn("nav-link", active(href) && "bg-ink/5")}>{label}</Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {site.phone && (
              <a href={`tel:${site.phone}`} className="hidden items-center gap-2 text-[15px] font-semibold xl:flex">
                <Phone size={16} />{site.phone}
              </a>
            )}
            {isAdmin && <Link href="/admin" className="link-u text-[15px] font-semibold">Admin</Link>}
            <Link href="/admissions#apply" className="btn btn-primary">Apply now</Link>
          </div>

          <button onClick={() => setOpen(!open)} aria-expanded={open}
            className="flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2.5 text-[15px] font-semibold lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}{open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-paper lg:hidden">
          <div className="container-x py-8">
            <nav className="border-t border-ink">
              {LINKS.map(([label, href]) => (
                <Link key={href} href={href} onClick={close} className="flex items-center justify-between border-b border-ink/15 py-5 text-4xl font-extrabold tracking-tight">
                  {label}<ArrowUpRight size={28} className="text-brand-600" />
                </Link>
              ))}
            </nav>
            {tracks.map((c) => (
              <div key={c._id} className="mt-8">
                <p className="text-[15px] font-semibold text-brand-700">{c.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.programs.map((p) => (
                    <Link key={p._id} href={`/courses/${p.slug}`} onClick={close} className="rounded-full border border-ink/20 px-4 py-2.5 text-[15px] font-semibold">{p.title}</Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-10 grid gap-3">
              <Link href="/admissions#apply" onClick={close} className="btn btn-primary btn-lg">Apply now</Link>
              {isAdmin && <Link href="/admin" onClick={close} className="btn btn-outline btn-lg">Admin panel</Link>}
            </div>
            {site.phone && <a href={`tel:${site.phone}`} className="mt-8 flex items-center gap-2 text-xl font-bold"><Phone size={20} />{site.phone}</a>}
          </div>
        </div>
      )}
    </>
  );
}
