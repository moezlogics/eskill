import * as M from "@/models";
import { connectDB } from "./db";
import { requireAdmin, hashPassword } from "./auth";
import { slugify } from "./utils";

const recent = { createdAt: -1 };
const userPop = { path: "user", select: "name email phone" };
const coursePop = { path: "course", select: "title slug" };

export const REGISTRY = {
  courses: { model: M.Course, slugFrom: "title", search: ["title"], populate: [{ path: "category", select: "name" }], listSelect: "-sections -description", sort: { order: 1, createdAt: 1 } },
  categories: { model: M.Category, slugFrom: "name", search: ["name"], sort: { order: 1, name: 1 } },
  instructors: { model: M.Instructor, search: ["name"], sort: { order: 1, createdAt: -1 } },
  orders: { model: M.Order, search: ["transactionId", "phone", "method"], populate: [userPop, coursePop], sort: recent },
  enrollments: { model: M.Enrollment, search: ["certificateId"], populate: [userPop, coursePop], sort: recent },
  users: { model: M.User, search: ["name", "email", "phone"], sort: recent },
  leads: { model: M.Lead, search: ["name", "phone", "email", "course"], sort: recent },
  events: { model: M.Event, slugFrom: "title", search: ["title"], sort: { date: -1 } },
  posts: { model: M.Post, slugFrom: "title", search: ["title"], sort: recent },
  pages: { model: M.Page, slugFrom: "title", search: ["title"], sort: recent },
  testimonials: { model: M.Testimonial, search: ["name"], sort: { order: 1, createdAt: -1 } },
  faqs: { model: M.Faq, search: ["question"], sort: { order: 1 } },
  partners: { model: M.Partner, search: ["name"], sort: { order: 1 } },
};

const json = (data, status = 200) => Response.json(data, { status });

export async function guard(params) {
  const { resource, id } = await params;
  const cfg = REGISTRY[resource];
  if (!cfg) return { error: json({ error: "Unknown resource" }, 404) };
  if (!(await requireAdmin())) return { error: json({ error: "Unauthorized" }, 401) };
  await connectDB();
  return { cfg, resource, id };
}

function clean(obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      obj[k] = v.length && v.every((x) => typeof x === "string")
        ? v.map((x) => x.trim()).filter(Boolean)
        : v.map((x) => (x && typeof x === "object" ? clean(x) : x));
    } else if (v && typeof v === "object") clean(v);
  }
  return obj;
}

export async function beforeSave(resource, data, isNew) {
  const cfg = REGISTRY[resource];
  for (const k of ["_id", "createdAt", "updatedAt", "__v"]) delete data[k];
  clean(data);
  for (const [k, v] of Object.entries(data)) {
    if (v === "" && cfg.model.schema.path(k)?.instance === "ObjectId") data[k] = null;
  }
  if (data.slug) data.slug = slugify(data.slug);
  else if (cfg.slugFrom && data[cfg.slugFrom] && (isNew || "slug" in data)) data.slug = slugify(data[cfg.slugFrom]);
  if (resource === "users") {
    if (data.password) data.password = await hashPassword(data.password);
    else {
      delete data.password;
      if (isNew) throw new Error("Password is required for new users");
    }
  }
  if (resource === "enrollments" && !data.certificateId) delete data.certificateId;
  return data;
}

export async function afterSave(resource, doc) {
  if (resource === "orders" && doc?.status === "approved" && doc.user && doc.course) {
    await M.Enrollment.updateOne(
      { user: doc.user, course: doc.course },
      { $setOnInsert: { progress: 0, completedLessons: [] } },
      { upsert: true }
    );
  }
}

export function errorResponse(e) {
  const msg = e?.code === 11000
    ? `Duplicate value — ${Object.keys(e.keyValue || {}).join(", ")} already exists`
    : e?.message || "Something went wrong";
  return json({ error: msg }, 400);
}
