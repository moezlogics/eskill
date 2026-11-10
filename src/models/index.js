import mongoose from "mongoose";

const { Schema } = mongoose;
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name });
const opts = { timestamps: true };
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

export const User = model("User", new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "admin"], default: "student" },
}, opts));

export const Category = model("Category", new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  icon: String, image: String, description: String,
  order: { type: Number, default: 0 }, showInMenu: { type: Boolean, default: true },
}, opts));

export const Instructor = model("Instructor", new Schema({
  name: { type: String, required: true }, designation: String, company: String,
  photo: String, bio: String, linkedin: String, order: { type: Number, default: 0 },
}, opts));

const LessonSchema = new Schema({
  title: { type: String, default: "Untitled lesson" },
  type: { type: String, default: "video" },
  videoUrl: String, duration: String, content: String,
  isFree: { type: Boolean, default: false },
});
const SectionSchema = new Schema({ title: String, weeks: String, summary: String, lessons: [LessonSchema] });

export const Course = model("Course", new Schema({
  title: { type: String, required: true }, slug: { type: String, unique: true },
  subtitle: String, description: String,
  category: ref("Category"), instructors: [ref("Instructor")],
  thumbnail: String, previewVideo: String,
  price: { type: Number, default: 0 }, salePrice: { type: Number, default: 0 },
  level: String, mode: String, language: String, duration: String, liveHours: String, projectsCount: String,
  schedule: String, classSize: String, intro: String, coverLabel: String,
  whoFor: [String], careerPaths: [String],
  differentiators: [{ title: String, text: String }],
  rating: { type: Number, default: 0 }, reviewsCount: { type: Number, default: 0 }, studentsCount: { type: Number, default: 0 },
  highlights: [String], outcomes: [String], requirements: [String],
  tools: [{ name: String, logo: String }],
  projects: [{ title: String, description: String, image: String }],
  batches: [{ startDate: Date, timing: String, days: String, seatsLeft: Number }],
  faqs: [{ question: String, answer: String }],
  sections: [SectionSchema],
  featured: { type: Boolean, default: false }, published: { type: Boolean, default: true }, order: { type: Number, default: 0 },
}, opts));

export const Testimonial = model("Testimonial", new Schema({
  name: String, role: String, company: String, photo: String, text: String,
  rating: { type: Number, default: 5 }, featured: { type: Boolean, default: true }, order: { type: Number, default: 0 },
}, opts));

export const Faq = model("Faq", new Schema({ question: String, answer: String, order: { type: Number, default: 0 } }, opts));

export const Post = model("Post", new Schema({
  title: { type: String, required: true }, slug: { type: String, unique: true },
  excerpt: String, cover: String, author: String, tags: [String], content: String,
  published: { type: Boolean, default: true },
}, opts));

export const Page = model("Page", new Schema({
  title: { type: String, required: true }, slug: { type: String, unique: true },
  content: String, published: { type: Boolean, default: true },
}, opts));

export const Partner = model("Partner", new Schema({ name: String, logo: String, order: { type: Number, default: 0 } }, opts));

export const Event = model("Event", new Schema({
  title: { type: String, required: true }, slug: String, date: Date, time: String, image: String,
  speaker: String, description: String, link: String,
  isFree: { type: Boolean, default: true }, published: { type: Boolean, default: true },
}, opts));

export const Lead = model("Lead", new Schema({
  name: String, phone: String, email: String, course: String, source: String, message: String, preferredTime: String, city: String,
  status: { type: String, default: "new" }, notes: String,
}, opts));

export const Order = model("Order", new Schema({
  user: ref("User"), course: ref("Course"), amount: Number, method: String,
  transactionId: String, phone: String, screenshot: String, note: String,
  status: { type: String, default: "pending" },
}, opts));

const EnrollmentSchema = new Schema({
  user: { ...ref("User"), required: true }, course: { ...ref("Course"), required: true },
  completedLessons: [String], progress: { type: Number, default: 0 },
  completedAt: Date, certificateId: { type: String, unique: true, sparse: true },
}, opts);
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
export const Enrollment = model("Enrollment", EnrollmentSchema);

export const Setting = model("Setting", new Schema(
  { key: { type: String, default: "site", unique: true } },
  { strict: false, timestamps: true }
));
