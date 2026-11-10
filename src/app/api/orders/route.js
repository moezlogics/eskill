import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Course, Order, Enrollment } from "@/models";
import { finalPrice } from "@/lib/utils";

const err = (error, status = 400) => Response.json({ error }, { status });

export async function POST(req) {
  const s = await getSession();
  if (!s) return err("Please log in first", 401);
  try {
    const b = await req.json();
    await connectDB();
    const course = await Course.findOne({ _id: b.courseId, published: true });
    if (!course) return err("Course not found", 404);
    if (await Enrollment.exists({ user: s.id, course: course._id })) return Response.json({ ok: true, enrolled: true });

    const amount = finalPrice(course);
    if (amount === 0) {
      await Order.create({ user: s.id, course: course._id, amount: 0, method: "Free", status: "approved" });
      await Enrollment.create({ user: s.id, course: course._id });
      return Response.json({ ok: true, enrolled: true });
    }
    if (!b.method || !String(b.transactionId || "").trim()) return err("Payment method and transaction ID are required");
    if (await Order.exists({ user: s.id, course: course._id, status: "pending" })) return err("You already have a payment under review for this course");

    await Order.create({
      user: s.id, course: course._id, amount, method: String(b.method), status: "pending",
      transactionId: String(b.transactionId).trim().slice(0, 100), phone: String(b.phone || "").slice(0, 30),
      screenshot: String(b.screenshot || "").slice(0, 300), note: String(b.note || "").slice(0, 1000),
    });
    return Response.json({ ok: true, pending: true });
  } catch {
    return err("Could not place order. Please try again.");
  }
}
