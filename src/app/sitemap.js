import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { Course, Post, Page } from "@/models";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  await connectDB();
  const s = await getSettings();
  const base = (s.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const [courses, posts, pages] = await Promise.all([
    Course.find({ published: true }).select("slug updatedAt").lean(),
    Post.find({ published: true }).select("slug updatedAt").lean(),
    Page.find({ published: true }).select("slug updatedAt").lean(),
  ]);
  const fixed = ["", "/courses", "/admissions", "/about", "/contact", "/events", "/blog"].map((p) => ({ url: base + p, changeFrequency: "weekly", priority: p ? 0.8 : 1 }));
  return [
    ...fixed,
    ...courses.map((c) => ({ url: `${base}/courses/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly", priority: 0.9 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...pages.map((p) => ({ url: `${base}/p/${p.slug}`, lastModified: p.updatedAt, priority: 0.3 })),
  ];
}
