import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { siteUrl } from "@/lib/billing";
import "./globals.css";
import { BRAND, LOCALE } from "@/lib/brand";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} – ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Junge oder Mädchen? Welcher Name? Wie schwer? Tippt mit Spielpunkten auf alles rund ums Baby – mit Live-Quoten wie an der Börse.",
  openGraph: { siteName: BRAND.name, locale: LOCALE.replace("-", "_"), type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#fffaf5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={LOCALE.split("-")[0]}
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
