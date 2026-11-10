// npm run seed             -> creates admin + programs (if DB has no programs)
// npm run seed -- --fresh  -> WARNING: deletes the whole database first
import mongoose from "mongoose";

for (const f of [".env.local", ".env"]) { try { process.loadEnvFile(f); } catch {} } // on a server, env vars may also come from the host
const SOFT = process.argv.includes("--soft"); // used by build: never fail the build
import bcrypt from "bcryptjs";
import * as M from "../src/models/index.js";
import { DEFAULT_SETTINGS } from "../src/lib/defaults.js";
import { TRACKS, PROGRAMS, GENERAL_FAQS, POSTS } from "./programs.mjs";

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-");
const inDays = (d) => { const x = new Date(); x.setUTCHours(0, 0, 0, 0); x.setUTCDate(x.getUTCDate() + d); return x; };
const capacity = (s = "") => Number(String(s).match(/\d+/)?.[0]) || 20;

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing - add it to .env or .env.local");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[ok] Connected to MongoDB");

  if (process.argv.includes("--fresh")) {
    await mongoose.connection.dropDatabase();
    console.log("[ok] Database cleared");
  }
  await Promise.all(Object.values(M).map((m) => m.init()));

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (await M.User.exists({ email })) {
    await M.User.updateOne({ email }, { role: "admin" });
    console.log(`[info] Admin already exists: ${email}`);
  } else {
    if (!password) throw new Error("ADMIN_PASSWORD missing in .env.local");
    await M.User.create({ name: "Administrator", email, password: await bcrypt.hash(password, 10), role: "admin" });
    console.log(`[ok] Admin created -> ${email} (password from .env.local)`);
  }

  await M.Setting.updateOne({ key: "site" }, { $setOnInsert: DEFAULT_SETTINGS }, { upsert: true });

  if (await M.Course.countDocuments()) {
    console.log("[info] Programs already exist - content skipped (reset with: npm run seed -- --fresh)");
    return;
  }

  const cats = await M.Category.insertMany(TRACKS.map((t, i) => ({ ...t, slug: slug(t.name), order: i })));
  const catId = (name) => cats.find((c) => c.name === name)._id;

  await M.Course.insertMany(PROGRAMS.map((p, i) => ({
    title: p.title, slug: slug(p.title.replace(/—.*$/, "")), subtitle: p.subtitle, intro: p.intro, description: p.description,
    category: catId(p.track), coverLabel: p.coverLabel, thumbnail: "",
    mode: "On-Campus", language: "Urdu / English",
    duration: p.duration, schedule: p.schedule, liveHours: p.liveHours, classSize: p.classSize, level: p.level, projectsCount: p.projectsCount,
    featured: !!p.featured, published: true, order: i + 1,
    whoFor: p.whoFor, outcomes: p.outcomes, differentiators: p.differentiators,
    highlights: p.highlights, requirements: p.requirements, careerPaths: p.careerPaths,
    tools: p.tools.map((name) => ({ name })),
    projects: p.projects.map(([title, description]) => ({ title, description })),
    faqs: p.faqs.map(([question, answer]) => ({ question, answer })),
    batches: [
      { startDate: inDays(14 + (i % 5) * 7), timing: "6:00 PM – 8:00 PM", days: "Mon · Wed · Fri", seatsLeft: capacity(p.classSize) },
      { startDate: inDays(42 + (i % 4) * 7), timing: "11:00 AM – 2:00 PM", days: "Sat · Sun", seatsLeft: capacity(p.classSize) },
    ],
    sections: p.modules.map((m) => ({ title: m.title, weeks: m.weeks, summary: m.summary, lessons: m.topics.map((t) => ({ title: t, type: "text" })) })),
  })));

  await M.Faq.insertMany(GENERAL_FAQS.map(([question, answer], i) => ({ question, answer, order: i + 1 })));
  await M.Post.insertMany(POSTS.map((p) => ({ ...p, author: "eSkill Team", published: true })));

  await M.Page.insertMany([
    ["Privacy Policy", "privacy-policy"],
    ["Terms and Conditions", "terms-and-conditions"],
    ["Refund Policy", "refund-policy"],
  ].map(([title, s]) => ({
    title, slug: s,
    content: `## ${title}\n\nThis is a template page. Please replace this text with your institute's official ${title.toLowerCase()} from Admin → Pages.\n\n- Explain what the policy covers\n- Explain how students can contact you\n- Mention the date it takes effect`,
  })));

  await M.Event.create({
    title: "Is SEO dead? Google vs AI search in 2026", slug: "seo-vs-ai-search-2026",
    date: inDays(9), time: "Saturday · 4:00 PM", speaker: "SEO trainer", isFree: true, published: true,
    description: "A free 90-minute on-campus session: how ChatGPT and Google AI Overviews are changing search, and what businesses and students should learn now. Bring your questions.",
  });

  console.log(`[ok] Added ${cats.length} tracks, ${PROGRAMS.length} programs, ${GENERAL_FAQS.length} FAQs, ${POSTS.length} blog posts and a workshop`);
}

main()
  .catch((e) => { console.error(SOFT ? "[seed skipped]" : "[error]", e.message); process.exitCode = SOFT ? 0 : 1; })
  .finally(() => mongoose.disconnect());
