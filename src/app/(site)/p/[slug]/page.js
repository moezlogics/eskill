import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Page } from "@/models";
import { plain, fmtDate } from "@/lib/utils";
import { PageHero, Prose } from "@/components/site/ui";
import { entityMeta } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const p = await Page.findOne({ slug }).lean();
  return p ? entityMeta(p, `/p/${slug}`, { description: p.content }) : {};
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const p = plain(await Page.findOne({ slug, published: true }).lean());
  if (!p) notFound();
  return (
    <>
      <PageHero title={p.title} />
      <section className="section">
        <div className="container-x max-w-3xl">
          <Prose text={p.content} />
          <p className="mt-10 text-sm text-muted">Last updated: {fmtDate(p.updatedAt)}</p>
        </div>
      </section>
    </>
  );
}
