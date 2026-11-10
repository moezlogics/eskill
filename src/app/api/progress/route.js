import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Course, Enrollment } from "@/models";

export async function POST(req) {
  const s = await getSession();
  if (!s) return Response.json({ error: "Please log in" }, { status: 401 });
  try {
    const { courseId, lessonId } = await req.json();
    await connectDB();
    const enr = await Enrollment.findOne({ user: s.id, course: courseId });
    if (!enr) return Response.json({ error: "You are not enrolled in this course" }, { status: 403 });
    const course = await Course.findById(courseId).select("sections").lean();
    const ids = (course?.sections || []).flatMap((sec) => sec.lessons.map((l) => String(l._id)));
    if (!ids.includes(lessonId)) return Response.json({ error: "Lesson not found" }, { status: 400 });

    const done = new Set(enr.completedLessons.filter((id) => ids.includes(id)));
    done.add(lessonId);
    enr.completedLessons = [...done];
    enr.progress = Math.round((done.size / ids.length) * 100);
    if (enr.progress >= 100 && !enr.certificateId) {
      enr.certificateId = `EDU-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      enr.completedAt = new Date();
    }
    await enr.save();
    return Response.json({ ok: true, progress: enr.progress, certificateId: enr.certificateId || null });
  } catch {
    return Response.json({ error: "Could not update progress" }, { status: 400 });
  }
}
