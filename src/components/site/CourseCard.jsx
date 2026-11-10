import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProgramCover } from "./ui";
import { fmtDate } from "@/lib/utils";

export const nextBatchOf = (c) => {
  const today = new Date(new Date().toDateString());
  return (c.batches || [])
    .filter((b) => b.startDate && new Date(b.startDate) >= today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
};

export default function CourseCard({ course: c }) {
  const nb = nextBatchOf(c);
  return (
    <Link href={`/courses/${c.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
        <ProgramCover course={c} showTitle={false} className="h-full w-full transition duration-700 group-hover:scale-[1.04]" />
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-2 text-[15px] font-semibold">
        <span className="text-brand-700">{c.category?.name || "Program"}</span>
        {c.mode && <><span className="text-ink/25">/</span><span className="text-muted">{c.mode}</span></>}
      </p>
      <h3 className="mt-2 text-[26px] leading-[1.1] font-extrabold tracking-[-0.025em] decoration-2 underline-offset-[6px] group-hover:underline">{c.title}</h3>
      {c.subtitle && <p className="mt-3 line-clamp-2 text-[16px] leading-relaxed text-muted">{c.subtitle}</p>}

      <dl className="mt-5 grid grid-cols-3 border-y border-ink/15 py-3.5 text-[15px]">
        <div><dt className="text-muted">Duration</dt><dd className="mt-0.5 font-semibold">{c.duration || "—"}</dd></div>
        <div className="border-l border-ink/15 pl-4"><dt className="text-muted">Level</dt><dd className="mt-0.5 font-semibold">{c.level || "All"}</dd></div>
        <div className="border-l border-ink/15 pl-4"><dt className="text-muted">Modules</dt><dd className="mt-0.5 font-semibold">{(c.sections || []).length || "—"}</dd></div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-[15px]">
          {nb ? <>Next batch <span className="font-bold">{fmtDate(nb.startDate)}</span></> : <span className="text-muted">Batch dates on request</span>}
        </p>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  );
}
