import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Enrollment } from "@/models";
import { PageHero } from "@/components/site/ui";

export const metadata = { title: "Verify certificate" };

export default async function VerifyPage({ searchParams }) {
  const { id = "" } = await searchParams;
  const certId = String(id).trim().toUpperCase();
  let missing = false;
  if (certId) {
    await connectDB();
    if (await Enrollment.exists({ certificateId: certId })) redirect(`/certificate/${encodeURIComponent(certId)}`);
    missing = true;
  }

  return (
    <>
      <PageHero eyebrow="Verification" title="Verify a certificate" text="Enter the certificate ID printed on the certificate to confirm it is genuine." />
      <section className="section">
        <div className="container-x max-w-2xl">
          <form action="/verify" className="rounded-[24px] border border-line bg-white p-8">
            <label className="label">Certificate ID</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input name="id" defaultValue={certId} required placeholder="e.g. EDU-2026-A1B2C3" className="input uppercase" />
              <button className="btn btn-dark">Verify</button>
            </div>
            {missing && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">No certificate found with this ID. Please check and try again.</p>}
          </form>
        </div>
      </section>
    </>
  );
}
