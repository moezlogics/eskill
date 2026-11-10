import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/resources";
import ResourceManager from "@/components/admin/ResourceManager";

export async function generateMetadata({ params }) {
  const { resource } = await params;
  return { title: RESOURCES[resource]?.label || "Admin" };
}

export default async function ResourcePage({ params }) {
  const { resource } = await params;
  if (!RESOURCES[resource]) notFound();
  return <ResourceManager key={resource} resource={resource} />;
}
