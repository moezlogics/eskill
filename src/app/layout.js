import "./globals.css";
import Script from "next/script";
import { Archivo, Instrument_Serif } from "next/font/google";
import { getSettings } from "@/lib/data";

const sans = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

// CMS changes show instantly
export const dynamic = "force-dynamic";

const safeUrl = (u) => { try { return u ? new URL(u) : undefined; } catch { return undefined; } };

export async function generateMetadata() {
  const s = await getSettings().catch(() => null);
  const name = s?.siteName || "eSkill Institute";
  return {
    metadataBase: safeUrl(s?.siteUrl || process.env.SITE_URL),
    title: { default: s?.seoTitle || `${name} — ${s?.tagline || ""}`, template: `%s | ${name}` },
    description: s?.seoDescription || s?.tagline,
    applicationName: name,
    openGraph: { siteName: name, locale: "en_PK", type: "website", images: s?.ogImage ? [s.ogImage] : [] },
    icons: s?.favicon ? { icon: s.favicon, apple: s.favicon } : undefined,
    verification: s?.googleVerification ? { google: s.googleVerification } : undefined,
  };
}

export default async function RootLayout({ children }) {
  const s = await getSettings().catch(() => null);
  const ga = /^G-[A-Z0-9]+$/i.test(s?.ga4Id || "") ? s.ga4Id : "";
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
        {children}
        {ga && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
