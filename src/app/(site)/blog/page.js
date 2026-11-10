import { connectDB } from "@/lib/db";
import { Post } from "@/models";
import { plain } from "@/lib/utils";
import { PageHero, PostCard, EmptyState } from "@/components/site/ui";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  await connectDB();
  const posts = plain(await Post.find({ published: true }).sort({ createdAt: -1 }).select("-content").lean());
  return (
    <>
      <PageHero eyebrow="Blog" title="Insights, guides & career tips" text="Practical articles on skills, freelancing and building a career in tech." />
      <section className="section">
        <div className="container-x">
          {posts.length ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <PostCard key={p._id} p={p} />)}</div>
          ) : (
            <EmptyState title="No articles yet" text="New articles are coming soon." />
          )}
        </div>
      </section>
    </>
  );
}
