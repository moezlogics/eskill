import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/site/ui";
import { AuthForm } from "@/components/site/client";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const { next = "" } = await searchParams;
  const safe = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "";
  const s = await getSession();
  if (s) redirect(safe || (s.role === "admin" ? "/admin" : "/dashboard"));
  return (
    <AuthShell title="Welcome back" text="Log in to continue learning.">
      <AuthForm mode="login" next={safe} />
    </AuthShell>
  );
}
