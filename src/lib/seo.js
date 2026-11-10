import { getSettings } from "./data";

const clip = (s = "", n = 160) => { const t = String(s).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

function build({ title, description, image, path, absolute = false, type = "website" }) {
  const images = image ? [image] : [];
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: { title, description, images, type, url: path },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images },
  };
}

/* Static pages: SEO from Settings → SEO & tracking */
export async function pageMeta(key, path, fallbackTitle) {
  const s = await getSettings();
  const custom = s[`seo_${key}_title`];
  const title = custom || (key === "home" ? s.seoTitle || `${s.siteName} — ${s.tagline || ""}` : fallbackTitle);
  return build({
    title, path, absolute: !!custom || key === "home",
    description: clip(s[`seo_${key}_description`] || s.seoDescription || s.tagline),
    image: s[`seo_${key}_image`] || s.ogImage,
  });
}

/* Programs, posts, pages: their own SEO fields, falling back to content */
export async function entityMeta(item, path, { title, description, image, type } = {}) {
  const s = await getSettings();
  return build({
    title: item.seoTitle || title || item.title,
    absolute: !!item.seoTitle,
    description: clip(item.seoDescription || description || s.seoDescription),
    image: item.ogImage || image || s.ogImage,
    path, type,
  });
}
