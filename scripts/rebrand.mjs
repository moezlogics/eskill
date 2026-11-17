// One-time update for an EXISTING database (keeps programs, applications, users):
//   npm run rebrand
// - renames eSkill -> Skill School in settings, posts and pages
// - sets the website URL
// - resets every program's batches to the first intake (FIRST_BATCHES in programs.mjs)
// - moves the sample workshop before the first batch
import mongoose from "mongoose";
import { FIRST_BATCHES } from "./programs.mjs";

for (const f of [".env.local", ".env"]) { try { process.loadEnvFile(f); } catch {} }

const NAME = "Skill School";
const SITE_URL = process.argv[2] || "https://skillschool.pk";
const swap = (v) => typeof v === "string"
  ? v.replace(/eSkills? Institute/g, NAME).replace(/eSkills?(?=\W|$)/g, NAME).replace(/https?:\/\/(www\.)?eskills\.pk/g, SITE_URL)
  : Array.isArray(v) ? v.map(swap) : v && typeof v === "object" && !(v instanceof Date) && !v._bsontype ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)])) : v;
const capacity = (s = "") => Number(String(s).match(/\d+/)?.[0]) || 20;

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing - add it to .env or .env.local");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const s = await db.collection("settings").findOne({ key: "site" });
  if (s) {
    const { _id, ...rest } = s;
    const next = swap(rest);
    next.siteUrl = SITE_URL;
    next.heroBadge = "Admissions open · First batch starts 4 Feb 2027";
    if (/yourinstitute|eskills/i.test(next.email || "")) next.email = "info@skillschool.pk";
    await db.collection("settings").updateOne({ _id }, { $set: next });
    console.log("[ok] Settings renamed, siteUrl =", SITE_URL);
  }

  let n = 0;
  for (const c of await db.collection("courses").find().toArray()) {
    await db.collection("courses").updateOne({ _id: c._id }, { $set: {
      batches: FIRST_BATCHES.map((b) => ({ _id: new mongoose.Types.ObjectId(), ...b, seatsLeft: capacity(c.classSize) })),
    } });
    n++;
  }
  console.log(`[ok] Batches reset for ${n} programs (first batch 4 Feb 2027)`);

  for (const col of ["posts", "pages"]) {
    for (const d of await db.collection(col).find().toArray()) {
      const { _id, ...rest } = d;
      await db.collection(col).updateOne({ _id }, { $set: swap(rest) });
    }
  }
  const ev = await db.collection("events").updateOne({ slug: "seo-vs-ai-search-2026" }, { $set: { date: new Date("2027-01-23T00:00:00Z") } });
  console.log("[ok] Posts/pages renamed" + (ev.modifiedCount ? ", workshop moved to 23 Jan 2027" : ""));
}

main().catch((e) => { console.error("[error]", e.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
