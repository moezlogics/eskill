import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/site/ui";
import { AuthForm } from "@/components/site/client";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }) {
  const { next = "" } = await searchParams;
  const safe = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "";
  const s = await getSession();
  if (s) redirect(safe || "/dashboard");
  return (
    <AuthShell title="Create your account" text="Join in seconds and start learning today.">
      <AuthForm mode="register" next={safe} />
    </AuthShell>
  );
}
