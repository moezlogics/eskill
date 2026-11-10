export const cn = (...c) => c.filter(Boolean).join(" ");

export const slugify = (s = "") =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");

export const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const plain = (d) => JSON.parse(JSON.stringify(d ?? null));

export const formatPrice = (n) => (Number(n) > 0 ? `Rs ${Number(n).toLocaleString("en-US")}` : "Free");
export const finalPrice = (c) => (c?.salePrice > 0 && c.salePrice < c.price ? c.salePrice : c?.price || 0);
export const discount = (c) => (c?.salePrice > 0 && c.salePrice < c.price ? Math.round(100 - (c.salePrice / c.price) * 100) : 0);
export const lessonCount = (c) => (c?.sections || []).reduce((n, s) => n + (s.lessons?.length || 0), 0);
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";

export function toEmbed(url = "") {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  return url;
}
export const isDirectVideo = (u = "") => /\.(mp4|webm|ogg)(\?|$)/i.test(u);

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}
