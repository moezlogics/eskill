import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post } from "@/models";
import { plain, fmtDate } from "@/lib/utils";
import { Prose, PostCard } from "@/components/site/ui";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const p = await Post.findOne({ slug }).select("title excerpt cover").lean();
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: p.cover ? [p.cover] : [] } } : {};
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const p = plain(await Post.findOne({ slug, published: true }).lean());
  if (!p) notFound();
  const more = plain(await Post.find({ published: true, _id: { $ne: p._id } }).sort({ createdAt: -1 }).limit(3).select("-content").lean());

  return (
    <article>
      <header className="container-x max-w-4xl pt-14 pb-10 sm:pt-20">
        <Link href="/blog" className="link-u inline-flex items-center gap-2 text-[15px] font-semibold"><ArrowLeft size={16} />All articles</Link>
        <h1 className="display-page mt-8">{p.title}</h1>
        {p.excerpt && <p className="mt-6 text-xl leading-relaxed text-muted">{p.excerpt}</p>}
        <p className="mt-8 border-t border-ink pt-4 text-[15px] text-muted">
          {[p.author && `By ${p.author}`, fmtDate(p.createdAt)].filter(Boolean).join(" · ")}
        </p>
      </header>

      {p.cover && (
        <div className="container-x max-w-5xl">
          <img src={p.cover} alt={p.title} className="max-h-[560px] w-full rounded-[28px] object-cover" />
        </div>
      )}

      <div className="container-x max-w-3xl py-14">
        <Prose text={p.content} className="text-[18px]" />
        {p.tags?.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
            {p.tags.map((t) => <span key={t} className="tag border border-ink/20">#{t}</span>)}
          </div>
        )}
      </div>

      {more.length > 0 && (
        <section className="section border-t border-line">
          <div className="container-x">
            <h2 className="display-2">Keep reading</h2>
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3">{more.map((m) => <PostCard key={m._id} p={m} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}
