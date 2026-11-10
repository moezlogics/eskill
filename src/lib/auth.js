import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE = "edu_session";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export const hashPassword = (p) => bcrypt.hash(p, 10);
export const checkPassword = (p, h) => bcrypt.compare(p, h);

export async function createSession(user) {
  const token = await new SignJWT({ id: String(user._id), name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const s = await getSession();
  return s?.role === "admin" ? s : null;
}
