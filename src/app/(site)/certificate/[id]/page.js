import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { Enrollment } from "@/models";
import { plain, fmtDate } from "@/lib/utils";
import { Logo } from "@/components/site/Header";
import { PrintButton } from "@/components/site/client";

export const metadata = { title: "Certificate" };

export default async function CertificatePage({ params }) {
  const { id } = await params;
  await connectDB();
  const e = plain(await Enrollment.findOne({ certificateId: decodeURIComponent(id) })
    .populate("user", "name").populate("course", "title duration").lean());
  if (!e || !e.user || !e.course) notFound();
  const s = await getSettings();

  return (
    <div className="py-12 print:py-0">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <p className="flex items-center gap-2 text-[16px] font-semibold">
            <CircleCheck size={20} className="text-emerald-600" />Verified certificate · <span className="font-mono">{e.certificateId}</span>
          </p>
          <PrintButton />
        </div>

        <div className="mx-auto w-full max-w-5xl bg-white p-3 shadow-[0_30px_80px_-30px_rgba(18,18,18,0.35)] sm:aspect-[1.414/1] print:shadow-none">
          <div className="flex h-full flex-col justify-between border-[3px] border-forest p-8 sm:p-14">
            <div className="flex items-start justify-between gap-6">
              <Logo name={s.siteName} logo={s.logo} />
              <p className="text-right text-[13px] text-muted">
                Certificate ID<br /><span className="font-mono text-[15px] font-semibold text-ink">{e.certificateId}</span>
              </p>
            </div>

            <div className="py-10 sm:py-0">
              <p className="text-[15px] font-semibold text-brand-700">Certificate of completion</p>
              <p className="mt-6 text-lg text-muted">This certifies that</p>
              <p className="mt-2 font-serif text-[clamp(40px,6vw,80px)] leading-none italic">{e.user.name}</p>
              <p className="mt-6 text-lg text-muted">has successfully completed</p>
              <p className="mt-2 text-[clamp(22px,2.6vw,34px)] leading-tight font-extrabold tracking-tight">{e.course.title}</p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/15 pt-6 text-[15px]">
              <div>
                <p className="font-semibold">{fmtDate(e.completedAt || e.updatedAt)}</p>
                <p className="text-muted">Date of completion</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl italic">{s.siteName}</p>
                <p className="text-muted">Issued by</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[14px] text-muted print:hidden">
          Anyone can verify this certificate on our website under &quot;Verify a certificate&quot;.
        </p>
      </div>
    </div>
  );
}
