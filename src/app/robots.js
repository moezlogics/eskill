import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function robots() {
  const s = await getSettings();
  const base = (s.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/dashboard", "/checkout", "/learn", "/login", "/register"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
