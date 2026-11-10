import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { createSession, destroySession, hashPassword, checkPassword } from "@/lib/auth";

const err = (error, status = 400) => Response.json({ error }, { status });

export async function POST(req, { params }) {
  const { action } = await params;
  if (action === "logout") {
    await destroySession();
    return Response.json({ ok: true });
  }
  const b = await req.json().catch(() => ({}));
  await connectDB();

  if (action === "register") {
    const name = String(b.name || "").trim();
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "");
    if (!name || !email || password.length < 6) return err("Name, email and a password of at least 6 characters are required");
    if (await User.exists({ email })) return err("An account with this email already exists");
    const user = await User.create({ name, email, phone: String(b.phone || "").trim(), password: await hashPassword(password) });
    await createSession(user);
    return Response.json({ ok: true, role: user.role });
  }

  if (action === "login") {
    const user = await User.findOne({ email: String(b.email || "").trim().toLowerCase() }).select("+password");
    if (!user || !(await checkPassword(String(b.password || ""), user.password))) return err("Invalid email or password", 401);
    await createSession(user);
    return Response.json({ ok: true, role: user.role });
  }

  return err("Not found", 404);
}
