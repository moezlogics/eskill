import { connectDB } from "@/lib/db";
import { Lead } from "@/models";

const str = (v, n) => String(v || "").trim().slice(0, n);

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return Response.json({ ok: true }); // honeypot for spam bots
  const name = str(b.name, 100), phone = str(b.phone, 30);
  if (!name || phone.replace(/\D/g, "").length < 7)
    return Response.json({ error: "Please enter your name and a valid phone number" }, { status: 400 });
  await connectDB();
  await Lead.create({ name, phone, email: str(b.email, 120), course: str(b.course, 150), message: str(b.message, 2000), source: str(b.source, 50) || "website", preferredTime: str(b.preferredTime, 60), city: str(b.city, 60) });
  return Response.json({ ok: true });
}
