import "./globals.css";
import { Archivo, Instrument_Serif } from "next/font/google";
import { getSettings } from "@/lib/data";

const sans = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

// CMS changes show instantly
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSettings().catch(() => null);
  const name = s?.siteName || "eSkill Institute";
  return {
    title: { default: s?.seoTitle || `${name} — Skills that get you paid`, template: `%s | ${name}` },
    description: s?.seoDescription || s?.tagline,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
